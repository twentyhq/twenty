import { Command } from 'nest-commander';
import { Not } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// OAuth logins created the application row with the default `local` source
// type before it was copied from the registration.
@RegisteredWorkspaceCommand('2.43.0', 1790352791059)
@Command({
  name: 'upgrade:2-43:backfill-oauth-only-application-source-type',
  description:
    'Set the source type of applications created by an OAuth login to `oauth-only`, like their registration',
})
export class BackfillOAuthOnlyApplicationSourceTypeCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
    private readonly applicationService: ApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // `local` was only the column default for these rows, and OAuth logins
    // already write `oauth-only`, so earlier versions expect this value too.
  }

  async up({
    workspaceId,
    options,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    const applications = await this.applicationRepository.find(workspaceId, {
      where: {
        sourceType: Not(ApplicationRegistrationSourceType.OAUTH_ONLY),
        applicationRegistration: {
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
      },
    });

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Found ${applications.length} OAuth application(s) to backfill on workspace ${workspaceId} (${index + 1}/${total})`,
    );

    if (dryRun) {
      return;
    }

    for (const application of applications) {
      await this.applicationService.update(application.id, {
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        workspaceId,
      });

      this.logger.log(
        `Set application "${application.name}" (${application.id}) to oauth-only`,
      );
    }
  }
}
