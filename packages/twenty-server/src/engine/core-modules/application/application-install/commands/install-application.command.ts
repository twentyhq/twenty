import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { parseBoundedPositiveInteger } from 'src/database/commands/utils/parse-bounded-positive-integer.util';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { runInBatches } from 'src/utils/run-in-batches.util';

type InstallApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  batchSize?: number;
  workspaceId?: Set<string>;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  yes?: boolean;
};

const MAX_BATCH_SIZE = 50;
const MAX_WORKSPACE_COUNT_LIMIT = 50;

@Command({
  name: 'application:install',
  description:
    'Install an application on every workspace that does not have it yet. Workspaces where it is already installed are left untouched, use application:upgrade for those',
})
export class InstallApplicationCommand extends CommandRunner {
  protected logger: CommandLogger;

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationInstallService: ApplicationInstallService,
  ) {
    super();
    this.logger = new CommandLogger({
      verbose: false,
      constructorName: this.constructor.name,
    });
  }

  @Option({
    flags:
      '-u, --application-registration-universal-identifier <application_registration_universal_identifier>',
    description: 'Application registration universal identifier',
    required: true,
  })
  parseApplicationRegistrationUniversalIdentifier(value: string): string {
    return value;
  }

  @Option({
    flags: '-b, --batch-size <batch_size>',
    description: `Number of workspaces installed in parallel (defaults to 5, max ${MAX_BATCH_SIZE})`,
    required: false,
  })
  parseBatchSize(value: string): number {
    return parseBoundedPositiveInteger(value, 'batch size', MAX_BATCH_SIZE);
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description:
      'Only install on the given workspace id. Can be repeated to target several workspaces. Targets all provisioned workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '--workspace-count-limit <count>',
    description: `Limit the number of workspaces to install on (max ${MAX_WORKSPACE_COUNT_LIMIT})`,
    required: false,
  })
  parseWorkspaceCountLimit(value: string): number {
    return parseBoundedPositiveInteger(
      value,
      'workspace count limit',
      MAX_WORKSPACE_COUNT_LIMIT,
    );
  }

  @Option({
    flags: '-d, --dry-run',
    description:
      'List the workspaces that would be installed without installing',
    required: false,
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '-y, --yes',
    description: 'Skip the confirmation prompt (for non-interactive usage)',
    required: false,
  })
  parseYes(): boolean {
    return true;
  }

  override async run(
    _passedParams: string[],
    options: InstallApplicationCommandOptions,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: {
        universalIdentifier: options.applicationRegistrationUniversalIdentifier,
      },
    });

    if (!isDefined(registration)) {
      throw new Error(
        `Application registration with universal identifier ${options.applicationRegistrationUniversalIdentifier} not found`,
      );
    }

    if (
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL ||
      registration.sourceType === ApplicationRegistrationSourceType.OAUTH_ONLY
    ) {
      throw new Error(
        `Cannot install application ${registration.universalIdentifier}: applications with source type ${registration.sourceType} have no code artifacts to install`,
      );
    }

    const targetVersion = registration.latestAvailableVersion;
    const versionLabel = targetVersion ?? 'latest available';

    const targetWorkspaceIds = await this.findTargetWorkspaceIds(options);

    if (targetWorkspaceIds.length === 0) {
      this.logger.warn('No workspace matches the given options, nothing to do');

      return;
    }

    const alreadyInstalledWorkspaceIds =
      await this.findAlreadyInstalledWorkspaceIds({
        universalIdentifier: registration.universalIdentifier,
        workspaceIds: targetWorkspaceIds,
      });

    const workspaceIdsToInstall = targetWorkspaceIds.filter(
      (workspaceId) => !alreadyInstalledWorkspaceIds.has(workspaceId),
    );

    if (alreadyInstalledWorkspaceIds.size > 0) {
      this.logger.log(
        `Skipping ${alreadyInstalledWorkspaceIds.size} workspace(s) where "${registration.name}" is already installed, run application:upgrade to update them`,
      );
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would install "${registration.name}" (${registration.universalIdentifier}) version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s)${
          workspaceIdsToInstall.length > 0
            ? `: ${workspaceIdsToInstall.join(', ')}`
            : ''
        }`,
      );

      return;
    }

    if (workspaceIdsToInstall.length === 0) {
      this.logger.log(
        `No workspace to install, every targeted workspace already has "${registration.name}" installed`,
      );

      return;
    }

    if (!(options.yes ?? false)) {
      const isConfirmed = await askCommandConfirmation(
        `Confirm installing application ${registration.universalIdentifier} version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s)`,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, no installation performed');

        return;
      }
    }

    this.logger.log(
      `Installing "${registration.name}" (${registration.universalIdentifier}) version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s)...`,
    );

    // Runs on the exact set shown at confirmation time, so installations
    // created while the operator answered are excluded.
    await runInBatches({
      items: workspaceIdsToInstall,
      batchSize: options.batchSize,
      handler: (workspaceId) =>
        this.applicationInstallService.installApplication({
          appRegistrationId: registration.id,
          version: targetVersion ?? undefined,
          workspaceId,
        }),
      onError: (workspaceId, error) => {
        this.logger.error(
          `Failed to install application ${registration.universalIdentifier} in workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      },
    });

    this.logger.log(chalk.blue('Command completed!'));
  }

  private async findTargetWorkspaceIds(
    options: InstallApplicationCommandOptions,
  ): Promise<string[]> {
    if (isDefined(options.workspaceId)) {
      const workspaceIds = Array.from(options.workspaceId);

      return isDefined(options.workspaceCountLimit)
        ? workspaceIds.slice(0, options.workspaceCountLimit)
        : workspaceIds;
    }

    const workspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: activationStatusIn(
          PROVISIONED_WORKSPACE_ACTIVATION_STATUSES,
        ),
      },
      order: { id: 'ASC' },
      take: options.workspaceCountLimit,
    });

    return workspaces.map((workspace) => workspace.id);
  }

  // Matches on the universal identifier, the same identity
  // ApplicationInstallService uses to decide between a fresh install and a
  // version upgrade, so a row with a stale registration id is not mistaken
  // for a missing installation.
  private async findAlreadyInstalledWorkspaceIds({
    universalIdentifier,
    workspaceIds,
  }: {
    universalIdentifier: string;
    workspaceIds: string[];
  }): Promise<Set<string>> {
    const existingApplications = await this.applicationRepository.find({
      select: ['workspaceId'],
      where: {
        universalIdentifier,
        workspaceId: In(workspaceIds),
      },
    });

    return new Set(
      existingApplications.map((application) => application.workspaceId),
    );
  }
}
