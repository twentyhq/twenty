import { MigrationCommandOptions } from 'src/database/commands/migration-command/migration-command.runner';

export interface MigrationCommandInterface {
  execute(
    passedParams: string[],
    options: MigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void>;
}
