import chunk from 'lodash.chunk';
import groupBy from 'lodash.groupby';
import { Command } from 'nest-commander';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type ObjectLiteral } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type CalendarEventRecordMove } from 'src/database/commands/upgrade-version-command/2-66/types/calendar-event-record-move.type';
import { buildCalendarEventDuplicatePairsQuery } from 'src/database/commands/upgrade-version-command/2-66/utils/build-calendar-event-duplicate-pairs-query.util';
import { computeRecordsToMoveToKeptCalendarEvent } from 'src/database/commands/upgrade-version-command/2-66/utils/compute-records-to-move-to-kept-calendar-event.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CalendarEventTargetWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-target.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const MERGE_BATCH_SIZE = 100;

const SHARING_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
];

const REQUIRED_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
  STANDARD_OBJECTS.calendarEventParticipant.universalIdentifier,
  STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
  STANDARD_OBJECTS.callRecording.universalIdentifier,
  STANDARD_OBJECTS.timelineActivity.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.66.0', 1795795780287)
@Command({
  name: 'upgrade:2-66:merge-duplicate-calendar-events',
  description:
    'Merge calendar events synced once per channel into one shared event, without emitting record events',
})
export class MergeDuplicateCalendarEventsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `Skipping calendar event merge for workspace ${workspaceId}: no workspace data source`,
      );

      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const hasRequiredObjects = REQUIRED_OBJECT_UNIVERSAL_IDENTIFIERS.every(
      (universalIdentifier) =>
        isDefined(
          findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier,
          }),
        ),
    );

    if (!hasRequiredObjects) {
      this.logger.warn(
        `Skipping calendar event merge for workspace ${workspaceId}: calendar objects not found`,
      );

      return;
    }

    const calendarChannels = (
      await this.calendarChannelRepository.find(workspaceId, {
        relations: { connectedAccount: true },
      })
    ).filter(({ connectedAccount }) =>
      SHARING_PROVIDERS.includes(connectedAccount.provider),
    );

    const hasChannelsSharingAProvider = SHARING_PROVIDERS.some(
      (provider) =>
        calendarChannels.filter(
          ({ connectedAccount }) => connectedAccount.provider === provider,
        ).length > 1,
    );

    if (!hasChannelsSharingAProvider) {
      return;
    }

    const duplicatePairs = await dataSource.query<
      { duplicateId: string; keeperId: string }[]
    >(
      buildCalendarEventDuplicatePairsQuery(
        getWorkspaceSchemaName(workspaceId),
      ),
      [
        calendarChannels.map(({ id }) => id),
        calendarChannels.map(
          ({ connectedAccount }) => connectedAccount.provider,
        ),
      ],
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would merge ${duplicatePairs.length} duplicate calendar events for workspace ${workspaceId}`,
      );

      return;
    }

    for (const batch of chunk(duplicatePairs, MERGE_BATCH_SIZE)) {
      await this.mergeBatch({
        workspaceId,
        keptCalendarEventIdByDuplicateId: new Map(
          batch.map(({ duplicateId, keeperId }) => [duplicateId, keeperId]),
        ),
      });
    }

    this.logger.log(
      `Merged ${duplicatePairs.length} duplicate calendar events for workspace ${workspaceId}`,
    );
  }

  private async mergeBatch({
    workspaceId,
    keptCalendarEventIdByDuplicateId,
  }: {
    workspaceId: string;
    keptCalendarEventIdByDuplicateId: Map<string, string>;
  }): Promise<void> {
    const duplicateIds = [...keptCalendarEventIdByDuplicateId.keys()];
    const duplicateAndKeptIds = [
      ...new Set([
        ...duplicateIds,
        ...keptCalendarEventIdByDuplicateId.values(),
      ]),
    ];
    const moveEveryRecord = (
      records: { id: string; calendarEventId: string | null }[],
    ): CalendarEventRecordMove[] =>
      records.flatMap(({ id, calendarEventId }) => {
        const keptCalendarEventId = isDefined(calendarEventId)
          ? keptCalendarEventIdByDuplicateId.get(calendarEventId)
          : undefined;

        return isDefined(keptCalendarEventId)
          ? [{ id, keptCalendarEventId }]
          : [];
      });

    await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      async (transactionScope) => {
        const associationRepository =
          this.getRepositoryWithoutEvents<CalendarChannelEventAssociationWorkspaceEntity>(
            {
              transactionScope,
              objectName: 'calendarChannelEventAssociation',
            },
          );
        const participantRepository =
          this.getRepositoryWithoutEvents<CalendarEventParticipantWorkspaceEntity>(
            {
              transactionScope,
              objectName: 'calendarEventParticipant',
            },
          );
        const targetRepository =
          this.getRepositoryWithoutEvents<CalendarEventTargetWorkspaceEntity>({
            transactionScope,
            objectName: 'calendarEventTarget',
          });
        const callRecordingRepository =
          this.getRepositoryWithoutEvents<CallRecordingWorkspaceEntity>({
            transactionScope,
            objectName: 'callRecording',
          });
        const timelineActivityRepository =
          this.getRepositoryWithoutEvents<TimelineActivityWorkspaceEntity>({
            transactionScope,
            objectName: 'timelineActivity',
          });
        const calendarEventRepository =
          this.getRepositoryWithoutEvents<CalendarEventWorkspaceEntity>({
            transactionScope,
            objectName: 'calendarEvent',
          });

        const associations = await associationRepository.find({
          where: { calendarEventId: In(duplicateIds) },
          withDeleted: true,
        });

        await this.moveRecordsToKeptCalendarEvents({
          repository: associationRepository,
          moves: moveEveryRecord(associations),
        });

        const participants = await participantRepository.find({
          where: { calendarEventId: In(duplicateAndKeptIds) },
        });

        await this.moveRecordsToKeptCalendarEvents({
          repository: participantRepository,
          moves: computeRecordsToMoveToKeptCalendarEvent({
            records: participants,
            keptCalendarEventIdByDuplicateId,
            getRecordKey: ({ handle }) => handle ?? '',
          }),
        });

        const targets = await targetRepository.find({
          where: { calendarEventId: In(duplicateAndKeptIds) },
        });

        await this.moveRecordsToKeptCalendarEvents({
          repository: targetRepository,
          moves: computeRecordsToMoveToKeptCalendarEvent({
            records: targets,
            keptCalendarEventIdByDuplicateId,
            getRecordKey: ({
              targetPersonId,
              targetCompanyId,
              targetOpportunityId,
            }) =>
              JSON.stringify([
                targetPersonId,
                targetCompanyId,
                targetOpportunityId,
              ]),
          }),
        });

        const callRecordings = await callRecordingRepository.find({
          where: { calendarEventId: In(duplicateIds) },
          withDeleted: true,
        });

        await this.moveRecordsToKeptCalendarEvents({
          repository: callRecordingRepository,
          moves: moveEveryRecord(callRecordings),
        });

        const timelineActivities = await timelineActivityRepository.find({
          where: { linkedRecordId: In(duplicateIds) },
          withDeleted: true,
        });

        for (const timelineActivityIds of chunk(
          timelineActivities.map(({ id }) => id),
          QUERY_MAX_RECORDS,
        )) {
          await timelineActivityRepository.delete(timelineActivityIds);
        }

        await calendarEventRepository.delete(duplicateIds);
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private getRepositoryWithoutEvents<TEntity extends ObjectLiteral>({
    transactionScope,
    objectName,
  }: {
    transactionScope: WorkspaceTransactionScope;
    objectName: string;
  }): WorkspaceRepository<TEntity> {
    return transactionScope.getRepositoryWithoutPermissionChecks<TEntity>(
      objectName,
      { shouldSkipEventEmission: true },
    );
  }

  private async moveRecordsToKeptCalendarEvents<TEntity extends ObjectLiteral>({
    repository,
    moves,
  }: {
    repository: WorkspaceRepository<TEntity>;
    moves: CalendarEventRecordMove[];
  }): Promise<void> {
    const movesByKeptCalendarEventId = groupBy(
      moves,
      ({ keptCalendarEventId }) => keptCalendarEventId,
    );

    for (const [
      keptCalendarEventId,
      movesToKeptCalendarEvent,
    ] of Object.entries(movesByKeptCalendarEventId)) {
      for (const recordIds of chunk(
        movesToKeptCalendarEvent.map(({ id }) => id),
        QUERY_MAX_RECORDS,
      )) {
        await repository.update(recordIds, {
          calendarEventId: keptCalendarEventId,
        });
      }
    }
  }
}
