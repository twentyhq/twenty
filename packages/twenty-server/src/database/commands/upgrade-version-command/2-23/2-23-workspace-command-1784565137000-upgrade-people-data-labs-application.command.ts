import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import * as semver from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ensureApplicationRegistrationLogoFileIdColumn } from 'src/database/commands/upgrade-version-command/2-23/utils/ensure-application-registration-logo-file-id-column.util';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

// packages/twenty-apps/public/people-data-labs APPLICATION_UNIVERSAL_IDENTIFIER
const PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER =
  '4a1178c1-3535-4a47-b592-231d3216b36f';

// First version whose views pin the re-derived name-free system relation
// field universal identifiers (introduced in 1.0.7) AND whose front components
// bundle React 19 to match the twenty-sdk runtime (fixed in 1.0.9).
const PEOPLE_DATA_LABS_TARGET_VERSION = '1.0.9';

@RegisteredWorkspaceCommand('2.23.0', 1784565137000)
@Command({
  name: 'upgrade:2-23:upgrade-people-data-labs-application',
  description:
    'Upgrade the people-data-labs application to 1.0.9 right after the system relation field universal identifier backfill, so its views reference the re-derived name-free identifiers instead of the stale pre-2.23 ones and its front components run on React 19. Workspaces already at or above 1.0.9 are left untouched.',
})
export class UpgradePeopleDataLabsApplicationCommand extends ProvisionedWorkspaceCommandRunner {
  // Instance-global DDL: run once per process, not per workspace.
  private hasEnsuredLogoFileIdColumn = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationUpgradeService: ApplicationUpgradeService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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

    // The 2.21 logoFileId command was skipped on instances that ran a 2.21
    // binary, so the column is absent and the findOne below crashes on it.
    // Repair it here since this is the command that breaks.
    if (!this.hasEnsuredLogoFileIdColumn) {
      if (isDryRun) {
        const columnExists = await this.logoFileIdColumnExists();

        if (!columnExists) {
          this.logger.log(
            'Would repair the missing core."applicationRegistration"."logoFileId" column',
          );

          return;
        }
      } else {
        await ensureApplicationRegistrationLogoFileIdColumn((sql) =>
          this.coreDataSource.query(sql),
        );
        this.hasEnsuredLogoFileIdColumn = true;
      }
    }

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
        // 1.0.9 pins engines.twenty >=2.23.0, but this command runs as part of
        // the 2.23 workspace upgrade itself, so the workspace has not yet been
        // marked as completing 2.23 and the compatibility check would reject
        // the install. The server is already on 2.23, so skip the check here.
        skipWorkspaceCompatibilityCheck: true,
      });

      this.logger.log(
        `Upgraded people-data-labs from ${application.version} to ${PEOPLE_DATA_LABS_TARGET_VERSION} for workspace ${workspaceId}`,
      );
    } catch (error) {
      // Non-fatal: the app stays functional at runtime (view fields reference
      // fields by database id); only a manifest re-sync of the stale version
      // would fail, and the upgrade can be retried from the UI.
      this.logger.error(
        `Failed to upgrade people-data-labs for workspace ${workspaceId}: ${error}`,
      );
    }
  }

  private async logoFileIdColumnExists(): Promise<boolean> {
    const rows = await this.coreDataSource.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'applicationRegistration' AND column_name = 'logoFileId'`,
    );

    return rows.length > 0;
  }
}
