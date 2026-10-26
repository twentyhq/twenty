import { Module } from '@nestjs/common';

import { ApplicationTransferPreFlightService } from 'src/database/commands/application-transfer/services/application-transfer-pre-flight.service';
import { ApplicationTransferStorageService } from 'src/database/commands/application-transfer/services/application-transfer-storage.service';
import { ApplicationTransferService } from 'src/database/commands/application-transfer/services/application-transfer.service';
import { TransferApplicationToWorkspaceCustomApplicationCommand } from 'src/database/commands/application-transfer/transfer-application-to-workspace-custom-application.command';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationRegistrationModule,
    ApplicationTranslationModule,
    CacheLockModule,
    SdkClientModule,
    WorkspaceCacheModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [
    ApplicationTransferPreFlightService,
    ApplicationTransferStorageService,
    ApplicationTransferService,
    TransferApplicationToWorkspaceCustomApplicationCommand,
  ],
})
export class ApplicationTransferModule {}
