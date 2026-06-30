import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { buildWorkspaceCustomApplicationRegistrationInput } from 'src/engine/core-modules/application/utils/build-workspace-custom-application-registration-input.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Existing workspaces predate the Custom application carrying an
// applicationRegistration, so their custom object/field labels cannot be
// translated. This command idempotently creates a workspace-scoped
// registration for each Custom application that lacks one and links it, then
// recomputes flatApplicationMaps so the label resolver picks it up
// immediately (it reads applicationRegistrationId from that cache).
@RegisteredWorkspaceCommand('2.18.0', 1810000005000)
@Command({
  name: 'upgrade:2-18:backfill-workspace-custom-application-registration',
  description:
    'Create a workspace-scoped application registration for each existing workspace Custom application so custom object/field labels become translatable.',
})
export class BackfillWorkspaceCustomApplicationRegistrationCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const workspace = await this.workspaceRepository.findOne({
      select: ['id', 'workspaceCustomApplicationId'],
      where: { id: workspaceId },
      withDeleted: true,
    });

    if (
      !isDefined(workspace) ||
      !isDefined(workspace.workspaceCustomApplicationId)
    ) {
      this.logger.log(
        `No custom application for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const customApplication = await this.applicationRepository.findOne({
      where: {
        id: workspace.workspaceCustomApplicationId,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(customApplication)) {
      this.logger.log(
        `Custom application ${workspace.workspaceCustomApplicationId} not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDefined(customApplication.applicationRegistrationId)) {
      this.logger.log(
        `Custom application for workspace ${workspaceId} already has a registration, skipping`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create an application registration for workspace ${workspaceId} custom application`,
      );

      return;
    }

    const registration = await this.applicationRegistrationRepository.save(
      this.applicationRegistrationRepository.create(
        buildWorkspaceCustomApplicationRegistrationInput({
          workspaceId,
          universalIdentifier: customApplication.universalIdentifier,
        }),
      ),
    );

    await this.applicationRepository.update(
      { id: customApplication.id, workspaceId },
      { applicationRegistrationId: registration.id },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatApplicationMaps',
    ]);

    this.logger.log(
      `Created application registration ${registration.id} for workspace ${workspaceId} custom application`,
    );
  }
}
