import { Module } from '@nestjs/common';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { ApplicationRegistrationVariableModule } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.module';
import { ApplicationTranslationModule } from 'src/engine/core-modules/application/application-translation/application-translation.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { RowLevelPermissionModule } from 'src/engine/metadata-modules/row-level-permission-predicate/row-level-permission.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';

@Module({
  imports: [
    FieldMetadataModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationRegistrationVariableModule,
    ApplicationTranslationModule,
    UserRoleModule,
    AiAgentRoleModule,
    ApiKeyModule,
    RowLevelPermissionModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
