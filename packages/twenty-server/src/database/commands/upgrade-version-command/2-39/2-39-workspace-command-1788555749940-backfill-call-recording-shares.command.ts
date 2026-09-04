import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const CALL_RECORDING_SHARE_CHUNK_SIZE = 500;

@RegisteredWorkspaceCommand('2.39.0', 1788555749940)
@Command({
  name: 'upgrade:2-39:backfill-call-recording-shares',
  description:
    'Insert one EVERYONE FULL recordShare row per existing callRecording, deleted ones included, so nothing a workspace member could do before the object became PRIVATE is lost once record sharing is enabled',
})
export class BackfillCallRecordingSharesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareService: RecordShareService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const callRecordingFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
      });

    if (!isDefined(callRecordingFlatObjectMetadata)) {
      return;
    }

    const recordShareFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
      });

    if (!isDefined(recordShareFlatObjectMetadata)) {
      this.logger.warn(
        `recordShare object not found for workspace ${workspaceId}, skipping call recording share backfill`,
      );

      return;
    }

    const callRecordingRepository =
      this.workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
        'callRecording',
        { shouldBypassPermissionChecks: true },
      );

    const callRecordings = await callRecordingRepository.find({
      select: ['id'],
      withDeleted: true,
    });

    if (callRecordings.length === 0) {
      this.logger.log(
        `No call recording to backfill shares for in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling EVERYONE shares for ${callRecordings.length} call recording(s) in workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const callRecordingsChunk of chunk(
      callRecordings,
      CALL_RECORDING_SHARE_CHUNK_SIZE,
    )) {
      await this.recordShareService.insertMany({
        workspaceId,
        recordShares: callRecordingsChunk.map((callRecording) => ({
          recordId: callRecording.id,
          objectMetadataId: callRecordingFlatObjectMetadata.id,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: callRecordingFlatObjectMetadata.id,
        })),
      });
    }

    this.logger.log(
      `Backfilled EVERYONE shares for ${callRecordings.length} call recording(s) in workspace ${workspaceId}`,
    );
  }
}
