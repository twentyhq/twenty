import { DynamicModule, Module } from '@nestjs/common';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { getMigrationCommandsForVersion } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import { MIGRATION_COMMAND_INJECTION_TOKEN } from 'src/database/commands/migration-command/migration-command.constants';

@Module({})
export class MigrationCommandModule {
  static register(version: string): DynamicModule {
    const commandClasses = getMigrationCommandsForVersion(version);

    return {
      module: MigrationCommandModule,
      providers: [
        ...commandClasses,
        {
          provide: MIGRATION_COMMAND_INJECTION_TOKEN,
          useFactory: (
            ...instances: MigrationCommandInterface[]
          ): MigrationCommandInterface[] => {
            return instances;
          },
          inject: commandClasses,
        },
      ],
      exports: [MIGRATION_COMMAND_INJECTION_TOKEN, ...commandClasses],
    };
  }
}
