import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreGraphQLApiModule } from 'src/engine/api/graphql/core-graphql-api.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/logic-function/logic-function-resource/sdk-client-generation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    CoreGraphQLApiModule,
    WorkspaceCacheModule,
  ],
  providers: [LogicFunctionResourceService, SdkClientGenerationService],
  exports: [LogicFunctionResourceService, SdkClientGenerationService],
})
export class LogicFunctionResourceModule {}
