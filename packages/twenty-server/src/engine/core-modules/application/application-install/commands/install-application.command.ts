import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { PROVISIONED_WORKSPACE_ACTIVATION_STATUSES } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { activationStatusIn } from 'src/database/commands/command-runners/utils/activation-status-in.util';
import { CommandLogger } from 'src/database/commands/logger';
import { askCommandConfirmation } from 'src/database/commands/utils/ask-command-confirmation.util';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type InstallApplicationCommandOptions = {
  applicationRegistrationUniversalIdentifier: string;
  batchSize?: number;
  workspaceId?: Set<string>;
  workspaceCountLimit?: number;
  dryRun?: boolean;
  yes?: boolean;
  upgrade?: boolean;
};

const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 50;
const MAX_WORKSPACE_COUNT_LIMIT = 50;

const parseBoundedPositiveInteger = (
  value: string,
  optionName: string,
  maximum: number,
): number => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new Error(
      `Invalid ${optionName} "${value}". Expected a positive integer`,
    );
  }

  if (parsedValue > maximum) {
    throw new Error(`Invalid ${optionName} "${value}". Maximum is ${maximum}`);
  }

  return parsedValue;
};

@Command({
  name: 'application:install',
  description:
    'Install an application on existing workspaces, upgrading the workspaces where it is already installed unless --no-upgrade is passed',
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
    description: `Number of workspaces processed in parallel (defaults to ${DEFAULT_BATCH_SIZE}, max ${MAX_BATCH_SIZE})`,
    required: false,
  })
  parseBatchSize(value: string): number {
    return parseBoundedPositiveInteger(value, 'batch size', MAX_BATCH_SIZE);
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description:
      'Only target the given workspace id. Can be repeated to target several workspaces. Targets all provisioned workspaces if not provided.',
    required: false,
  })
  parseWorkspaceId(value: string, previous?: Set<string>): Set<string> {
    const accumulator = previous ?? new Set<string>();

    accumulator.add(value);

    return accumulator;
  }

  @Option({
    flags: '--workspace-count-limit <count>',
    description: `Limit the number of workspaces to target (max ${MAX_WORKSPACE_COUNT_LIMIT})`,
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
    flags: '--no-upgrade',
    description:
      'Leave workspaces where the application is already installed untouched (upgrade is enabled by default)',
    required: false,
  })
  parseNoUpgrade(): boolean {
    return false;
  }

  @Option({
    flags: '-d, --dry-run',
    description:
      'List the workspaces that would be installed or upgraded without touching them',
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

    const targetWorkspaceIds = await this.findTargetWorkspaceIds(options);

    if (targetWorkspaceIds.length === 0) {
      this.logger.warn('No workspace matches the given options, nothing to do');

      return;
    }

    const existingApplications = await this.applicationRepository.find({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: In(targetWorkspaceIds),
      },
    });

    const existingApplicationByWorkspaceId = new Map(
      existingApplications.map((application) => [
        application.workspaceId,
        application,
      ]),
    );

    const workspaceIdsToInstall = targetWorkspaceIds.filter(
      (workspaceId) => !existingApplicationByWorkspaceId.has(workspaceId),
    );

    const shouldUpgrade = options.upgrade ?? true;

    const workspaceIdsToUpgrade = shouldUpgrade
      ? targetWorkspaceIds.filter((workspaceId) => {
          const existingApplication =
            existingApplicationByWorkspaceId.get(workspaceId);

          if (!isDefined(existingApplication)) {
            return false;
          }

          return (
            !isDefined(targetVersion) ||
            existingApplication.version !== targetVersion
          );
        })
      : [];

    const versionLabel = targetVersion ?? 'latest available';

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would install "${registration.name}" (${registration.universalIdentifier}) version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s)${
          workspaceIdsToInstall.length > 0
            ? `: ${workspaceIdsToInstall.join(', ')}`
            : ''
        }`,
      );
      this.logger.log(
        `[DRY RUN] Would then upgrade ${workspaceIdsToUpgrade.length} workspace(s) where it is already installed${
          workspaceIdsToUpgrade.length > 0
            ? `: ${workspaceIdsToUpgrade.join(', ')}`
            : ''
        }`,
      );

      return;
    }

    if (
      workspaceIdsToInstall.length === 0 &&
      workspaceIdsToUpgrade.length === 0
    ) {
      this.logger.log(
        `Nothing to do, every targeted workspace already runs "${registration.name}" version ${versionLabel}`,
      );

      return;
    }

    if (!(options.yes ?? false)) {
      const isConfirmed = await askCommandConfirmation(
        `Confirm installing application ${registration.universalIdentifier} version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s) and upgrading ${workspaceIdsToUpgrade.length} workspace(s)`,
      );

      if (!isConfirmed) {
        this.logger.log('Aborted, no installation performed');

        return;
      }
    }

    // Runs on the exact set shown at confirmation time, so installations
    // created or versions published while the operator answered are excluded.
    // Workspaces that already have the application are handled last so a
    // failing upgrade never delays the fresh installs.
    if (workspaceIdsToInstall.length > 0) {
      this.logger.log(
        `Installing "${registration.name}" (${registration.universalIdentifier}) version ${versionLabel} on ${workspaceIdsToInstall.length} workspace(s)...`,
      );

      await this.installOnWorkspaces({
        registration,
        targetVersion,
        workspaceIds: workspaceIdsToInstall,
        batchSize: options.batchSize,
      });
    }

    if (workspaceIdsToUpgrade.length > 0) {
      this.logger.log(
        `Upgrading "${registration.name}" (${registration.universalIdentifier}) to version ${versionLabel} on ${workspaceIdsToUpgrade.length} already installed workspace(s)...`,
      );

      await this.installOnWorkspaces({
        registration,
        targetVersion,
        workspaceIds: workspaceIdsToUpgrade,
        batchSize: options.batchSize,
      });
    }

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

  private async installOnWorkspaces({
    registration,
    targetVersion,
    workspaceIds,
    batchSize = DEFAULT_BATCH_SIZE,
  }: {
    registration: ApplicationRegistrationEntity;
    targetVersion: string | null;
    workspaceIds: string[];
    batchSize?: number;
  }): Promise<void> {
    const sanitizedBatchSize = Math.max(1, Math.floor(batchSize));

    for (
      let batchStart = 0;
      batchStart < workspaceIds.length;
      batchStart += sanitizedBatchSize
    ) {
      const batch = workspaceIds.slice(
        batchStart,
        batchStart + sanitizedBatchSize,
      );

      await Promise.all(
        batch.map(async (workspaceId) => {
          try {
            await this.applicationInstallService.installApplication({
              appRegistrationId: registration.id,
              version: targetVersion ?? undefined,
              workspaceId,
            });
          } catch (error) {
            this.logger.error(
              `Failed to install application ${registration.universalIdentifier} in workspace ${workspaceId}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }),
      );
    }
  }
}
