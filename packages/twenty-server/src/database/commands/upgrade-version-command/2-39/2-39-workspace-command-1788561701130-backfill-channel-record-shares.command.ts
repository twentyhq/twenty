import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { CalendarChannelRecordShareService } from 'src/modules/calendar/common/services/calendar-channel-record-share.service';
import { MessageChannelRecordShareService } from 'src/modules/messaging/common/services/message-channel-record-share.service';

@RegisteredWorkspaceCommand('2.39.0', 1788561701130)
@Command({
  name: 'upgrade:2-39:backfill-channel-record-shares',
  description:
    'Rebuild the owner FULL and everyone READ recordShare rows of every message channel and calendar channel from their association tables, so messages, threads and calendar events keep their readers once those objects become PRIVATE',
})
export class BackfillChannelRecordSharesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly messageChannelRecordShareService: MessageChannelRecordShareService,
    private readonly calendarChannelRecordShareService: CalendarChannelRecordShareService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    const recordShareFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
      });

    if (!isDefined(recordShareFlatObjectMetadata)) {
      this.logger.warn(
        `recordShare object not found for workspace ${workspaceId}, skipping channel record share backfill`,
      );

      return;
    }

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.message.universalIdentifier
        ],
      ) ||
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.calendarEvent.universalIdentifier
        ],
      )
    ) {
      this.logger.warn(
        `message or calendarEvent object not found for workspace ${workspaceId}, skipping channel record share backfill`,
      );

      return;
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: { workspaceId },
      select: { id: true },
    });
    const calendarChannels = await this.calendarChannelRepository.find({
      where: { workspaceId },
      select: { id: true },
    });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Backfilling record shares for ${messageChannels.length} message channel(s) and ${calendarChannels.length} calendar channel(s) in workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    for (const messageChannel of messageChannels) {
      await this.messageChannelRecordShareService.rebuildRecordSharesForMessageChannel(
        { workspaceId, messageChannelId: messageChannel.id },
      );
    }

    for (const calendarChannel of calendarChannels) {
      await this.calendarChannelRecordShareService.rebuildRecordSharesForCalendarChannel(
        { workspaceId, calendarChannelId: calendarChannel.id },
      );
    }

    this.logger.log(
      `Backfilled record shares for ${messageChannels.length} message channel(s) and ${calendarChannels.length} calendar channel(s) in workspace ${workspaceId}`,
    );
  }
}
