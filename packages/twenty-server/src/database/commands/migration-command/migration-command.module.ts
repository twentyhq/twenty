import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';

import { MigrationCommandInterface } from 'src/database/commands/migration-command/interfaces/migration-command.interface';

import { createUpgradeAllCommand } from 'src/database/commands/migration-command/create-upgrade-all-command.factory';
import { getMigrationCommandsForVersion } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import { MIGRATION_COMMAND_INJECTION_TOKEN } from 'src/database/commands/migration-command/migration-command.constants';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { SyncWorkspaceLoggerModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({})
export class MigrationCommandModule {
  static register(
    version: string,
    moduleMetadata: ModuleMetadata,
  ): DynamicModule {
    const commandClasses = getMigrationCommandsForVersion(version);
    const upgradeAllCommand = createUpgradeAllCommand(version);

    return {
      module: MigrationCommandModule,
      imports: [
        SyncWorkspaceLoggerModule,
        ...(moduleMetadata.imports ?? []),
        WorkspaceSyncMetadataModule,
        DataSourceModule,
      ],
      providers: [
        ...(moduleMetadata.providers ?? []),
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
        upgradeAllCommand,
      ],
      exports: [
        ...(moduleMetadata.exports ?? []),
        MIGRATION_COMMAND_INJECTION_TOKEN,
        ...commandClasses,
        upgradeAllCommand,
      ],
    };
  }
}
