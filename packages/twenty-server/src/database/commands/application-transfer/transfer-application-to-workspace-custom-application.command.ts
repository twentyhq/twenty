import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { isValidUuid } from 'twenty-shared/utils';

import { ApplicationTransferService } from 'src/database/commands/application-transfer/services/application-transfer.service';

type TransferApplicationToWorkspaceCustomApplicationCommandOptions = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  dryRun?: boolean;
  adoptDefaultRole?: boolean;
  deleteRegistration?: boolean;
};

const parseUuidOrThrow = (value: string): string => {
  if (!isValidUuid(value)) {
    throw new Error(`"${value}" is not a valid UUID`);
  }

  return value;
};

@Command({
  name: 'application:transfer-to-workspace-custom-application',
  description:
    'Move every entity of an installed application into the workspace custom application, keeping all data (run with --dry-run first)',
})
export class TransferApplicationToWorkspaceCustomApplicationCommand extends CommandRunner {
  private readonly logger = new Logger(
    TransferApplicationToWorkspaceCustomApplicationCommand.name,
  );

  constructor(
    private readonly applicationTransferService: ApplicationTransferService,
  ) {
    super();
  }

  @Option({
    flags: '--workspace-id <workspaceId>',
    description: 'Workspace holding the application',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return parseUuidOrThrow(value);
  }

  @Option({
    flags:
      '--application-universal-identifier <applicationUniversalIdentifier>',
    description: 'Universal identifier of the application to transfer',
    required: true,
  })
  parseApplicationUniversalIdentifier(value: string): string {
    return parseUuidOrThrow(value);
  }

  @Option({
    flags: '--dry-run',
    description: 'Only print the pre-flight report',
  })
  parseDryRun(): boolean {
    return true;
  }

  @Option({
    flags: '--adopt-default-role',
    description:
      "Make the transferred application's default role the custom application default role",
  })
  parseAdoptDefaultRole(): boolean {
    return true;
  }

  @Option({
    flags: '--delete-registration',
    description:
      'Delete the application registration when this workspace owns it and no other workspace installs it',
  })
  parseDeleteRegistration(): boolean {
    return true;
  }

  async run(
    _passedParams: string[],
    options: TransferApplicationToWorkspaceCustomApplicationCommandOptions,
  ): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const report =
      await this.applicationTransferService.transferToWorkspaceCustomApplicationOrThrow(
        {
          workspaceId: options.workspaceId,
          applicationUniversalIdentifier:
            options.applicationUniversalIdentifier,
          isDryRun,
          shouldAdoptDefaultRole: options.adoptDefaultRole ?? false,
          shouldDeleteRegistration: options.deleteRegistration ?? false,
        },
      );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Transfer report:\n${JSON.stringify(report, null, 2)}`,
    );

    if (isDryRun && report.blockers.length > 0) {
      this.logger.warn(
        `The transfer would be refused:\n- ${report.blockers.join('\n- ')}`,
      );
    }
  }
}
