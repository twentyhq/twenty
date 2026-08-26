import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { MESSAGE_CALENDAR_TARGET_BACKFILL_UPGRADE_COMMAND_NAME } from 'src/engine/core-modules/target/constants/message-calendar-target-migration.constants';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import {
  getTargetFieldNameForObjectRecord,
  type TargetFilter,
} from 'src/engine/core-modules/target/utils/get-target-field-name-for-object-record.util';
import { isUpgradeSequenceCursorAtOrAfterCommand } from 'src/engine/core-modules/target/utils/is-upgrade-sequence-cursor-at-or-after-command.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class MessageCalendarTargetReadinessService {
  // Backfill completion is monotonic per workspace, so positive results are
  // memoized to keep the per-request timeline path off the core database.
  private readonly backfillCompletedWorkspaceIds = new Set<string>();

  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async resolveTargetFilter({
    objectNameSingular,
    recordId,
    workspaceId,
  }: {
    objectNameSingular: string;
    recordId: string;
    workspaceId: string;
  }): Promise<TargetFilter | undefined> {
    const fieldName = getTargetFieldNameForObjectRecord(objectNameSingular);

    if (!isDefined(fieldName) || !(await this.isReady(workspaceId))) {
      return undefined;
    }

    return { fieldName, recordId };
  }

  async isReady(workspaceId: string): Promise<boolean> {
    const isBackfillCompleted = await this.isBackfillCompleted(workspaceId);

    if (!isBackfillCompleted) {
      return false;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return [
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
      ),
    );
  }

  private async isBackfillCompleted(workspaceId: string): Promise<boolean> {
    if (this.backfillCompletedWorkspaceIds.has(workspaceId)) {
      return true;
    }

    const isCompleted = await this.resolveBackfillCompletion(workspaceId);

    if (isCompleted) {
      this.backfillCompletedWorkspaceIds.add(workspaceId);
    }

    return isCompleted;
  }

  private async resolveBackfillCompletion(
    workspaceId: string,
  ): Promise<boolean> {
    if (
      await this.upgradeMigrationService.isLastAttemptCompleted({
        name: MESSAGE_CALENDAR_TARGET_BACKFILL_UPGRADE_COMMAND_NAME,
        workspaceId,
      })
    ) {
      return true;
    }

    const workspaceCursor = (
      await this.upgradeMigrationService.getWorkspaceLastAttemptedCommandName([
        workspaceId,
      ])
    ).get(workspaceId);

    if (!workspaceCursor?.isInitial || workspaceCursor.status !== 'completed') {
      return false;
    }

    return isUpgradeSequenceCursorAtOrAfterCommand({
      commandName: MESSAGE_CALENDAR_TARGET_BACKFILL_UPGRADE_COMMAND_NAME,
      cursorName: workspaceCursor.name,
      sequence: this.upgradeSequenceReaderService.getUpgradeSequence(),
    });
  }
}
