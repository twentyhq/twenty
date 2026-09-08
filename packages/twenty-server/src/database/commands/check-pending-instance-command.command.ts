import { Logger } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { InstanceCommandGenerationService } from 'src/database/commands/instance-command-generation.service';

// The core schema is built exclusively by legacy TypeORM migrations and
// instance commands, never by synchronize. An entity change that ships without
// a matching instance command therefore leaves the database behind the code, so
// CI has to notice before the change reaches an upgrade.
@Command({
  name: 'check:pending-instance-command',
  description:
    'Fail if entity metadata has schema changes that no instance command covers',
})
export class CheckPendingInstanceCommandCommand extends CommandRunner {
  private readonly logger = new Logger(CheckPendingInstanceCommandCommand.name);

  constructor(
    private readonly instanceCommandGenerationService: InstanceCommandGenerationService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const pendingSchemaChanges =
      await this.instanceCommandGenerationService.getPendingSchemaChanges();

    if (pendingSchemaChanges.length === 0) {
      this.logger.log(
        'No pending schema changes: entity metadata matches the migrated database.',
      );

      return;
    }

    this.logger.error(
      `${pendingSchemaChanges.length} pending schema change(s) detected. Entity metadata does not match the migrated database:`,
    );

    for (const { query, parameters } of pendingSchemaChanges) {
      const formattedParameters =
        parameters && parameters.length > 0
          ? ` -- parameters: ${JSON.stringify(parameters)}`
          : '';

      this.logger.error(`  ${query};${formattedParameters}`);
    }

    this.logger.error(
      'Generate an instance command covering these changes and commit it:\n' +
        '  npx nx run twenty-server:database:migrate:generate --name <descriptive-name> --type <fast|slow>',
    );

    // Signalling through the exit code instead of throwing keeps this a plain
    // check result rather than an exception reported to the error tracker.
    process.exitCode = 1;
  }
}
