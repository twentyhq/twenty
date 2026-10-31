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

export const STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS = [
  {
    nameSingular: 'note',
    universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.note.noteTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'noteTarget',
    universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.noteTarget.targetPerson.universalIdentifier,
    ],
  },
  {
    nameSingular: 'task',
    universalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.task.taskTargets.universalIdentifier,
    ],
  },
  {
    nameSingular: 'taskTarget',
    universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    readabilityParentFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.taskTarget.targetPerson.universalIdentifier,
    ],
  },
] as const;

@RegisteredWorkspaceCommand('2.41.0', 1789373200002)
@Command({
  name: 'upgrade:2-41:make-notes-and-tasks-inherit-their-targets',
  description:
    'Set the readability of the existing note and task standard objects to INHERITED through their note targets and task targets, and point the existing noteTarget and taskTarget objects at their targets instead of the note or task, as the standard application now declares them; workspaces created after the change already have it',
})
export class MakeNotesAndTasksInheritTheirTargetsCommand extends ProvisionedWorkspaceCommandRunner {
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
      objects: STANDARD_OBJECTS_TO_INHERIT_THROUGH_TARGETS,
      dryRun: isDryRun,
    });

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would make' : 'Made'} ${updatedCount} note and task object(s) inherit their parents for workspace ${workspaceId}`,
    );
  }
}
