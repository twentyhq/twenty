import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { setLegacyInheritedReadability } from 'src/database/commands/upgrade-version-command/2-41/utils/set-legacy-inherited-readability.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

export const STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED = [
  {
    nameSingular: 'attachment',
    universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.attachment.targetNote.universalIdentifier,
    ],
  },
  {
    nameSingular: 'timelineActivity',
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.timelineActivity.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.note.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.task.universalIdentifier,
    ],
  },
  {
    nameSingular: 'messageThreadTarget',
    universalIdentifier:
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
        .universalIdentifier,
    ],
  },
  {
    nameSingular: 'calendarEventTarget',
    universalIdentifier:
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent
        .universalIdentifier,
    ],
  },
] as const;

@RegisteredWorkspaceCommand('2.41.0', 1789373200001)
@Command({
  name: 'upgrade:2-41:make-standard-child-objects-inherited',
  description:
    'Set the readability of the existing attachment, timelineActivity, noteTarget, taskTarget, messageThreadTarget and calendarEventTarget standard objects to INHERITED with their parent fields, as the standard application now declares them; workspaces created after the change already have it',
})
export class MakeStandardChildObjectsInheritedCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;
    const updatedCount = await setLegacyInheritedReadability({
      coreDataSource: this.coreDataSource,
      workspaceId,
      objects: STANDARD_CHILD_OBJECTS_TO_MAKE_INHERITED,
      dryRun: isDryRun,
    });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would make' : 'Made'} ${updatedCount} standard child object(s) inherit their parents for workspace ${workspaceId}`,
    );
  }
}
