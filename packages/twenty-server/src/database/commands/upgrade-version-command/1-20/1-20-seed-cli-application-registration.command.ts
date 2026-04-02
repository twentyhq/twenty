import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';

@Command({
  name: 'upgrade:1-20:seed-cli-application-registration',
  description:
    'Seed the Twenty CLI application registration for OAuth-based CLI login',
})
export class SeedCliApplicationRegistrationCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private hasRun = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId: _,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    if (this.hasRun) {
      return;
    }

    if (dryRun) {
      this.logger.log(
        '[DRY RUN] Skipping CLI application registration seeding',
      );
      return;
    }

    const result =
      await this.applicationRegistrationService.createCliRegistrationIfNotExists();

    this.hasRun = true;

    if (result) {
      this.logger.log(
        `CLI application registration created (clientId: ${result.oAuthClientId})`,
      );
    } else {
      this.logger.log('CLI application registration already exists, skipping');
    }
  }
}
