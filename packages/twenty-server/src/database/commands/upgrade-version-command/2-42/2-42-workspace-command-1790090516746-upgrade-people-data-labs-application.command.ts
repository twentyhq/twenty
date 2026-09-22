import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import * as semver from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

// packages/twenty-apps/public/people-data-labs APPLICATION_UNIVERSAL_IDENTIFIER
const PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER =
  '4a1178c1-3535-4a47-b592-231d3216b36f';

// First version whose enrichment workflow seeding runs on the core workflow
// operations, which only exist from 2.42 on.
const PEOPLE_DATA_LABS_TARGET_VERSION = '1.0.11';

@RegisteredWorkspaceCommand('2.42.0', 1790090516746)
@Command({
  name: 'upgrade:2-42:upgrade-people-data-labs-application',
  description:
    'Upgrade the people-data-labs application to 1.0.11, whose enrichment workflow seeding runs on the core workflow operations exposed in 2.42. Workspaces already at or above 1.0.11 are left untouched.',
})
export class UpgradePeopleDataLabsApplicationToCoreWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationUpgradeService: ApplicationUpgradeService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const application = await this.applicationRepository.findOne({
      where: {
        workspaceId,
        universalIdentifier: PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      relations: ['applicationRegistration'],
    });

    if (!isDefined(application)) {
      return;
    }

    const applicationRegistration = application.applicationRegistration;

    if (!isDefined(applicationRegistration)) {
      this.logger.warn(
        `people-data-labs is installed but has no application registration, skipping upgrade for workspace ${workspaceId}`,
      );

      return;
    }

    const installedVersion = semver.valid(application.version);

    if (
      isDefined(installedVersion) &&
      semver.gte(installedVersion, PEOPLE_DATA_LABS_TARGET_VERSION)
    ) {
      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would upgrade people-data-labs from ${application.version} to ${PEOPLE_DATA_LABS_TARGET_VERSION} for workspace ${workspaceId}`,
      );

      return;
    }

    try {
      await this.applicationUpgradeService.upgradeApplication({
        appRegistrationId: applicationRegistration.id,
        targetVersion: PEOPLE_DATA_LABS_TARGET_VERSION,
        workspaceId,
        // 1.0.11 pins engines.twenty >=2.42.0, but this command runs as part of
        // the 2.42 workspace upgrade itself, so the workspace has not yet been
        // marked as completing 2.42 and the compatibility check would reject
        // the install. The server is already on 2.42, so skip the check here.
        skipWorkspaceCompatibilityCheck: true,
      });

      this.logger.log(
        `Upgraded people-data-labs from ${application.version} to ${PEOPLE_DATA_LABS_TARGET_VERSION} for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upgrade people-data-labs for workspace ${workspaceId}: ${error}`,
      );

      throw error;
    }
  }
}
