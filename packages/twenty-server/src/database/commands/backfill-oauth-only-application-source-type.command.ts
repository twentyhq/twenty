import { Command } from 'nest-commander';
import { Not } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// Backfill: OAuth logins created the application row with the default
// `local` source type before it was copied from the registration. Idempotent.
@Command({
  name: 'application:backfill-oauth-only-source-type',
  description:
    'Set the source type of applications created by an OAuth login to `oauth-only`, like their registration. Idempotent.',
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

  override async runOnWorkspace({
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
