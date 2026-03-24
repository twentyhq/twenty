import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreGraphQLApiModule } from 'src/engine/api/graphql/core-graphql-api.module';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SdkClientController } from 'src/engine/core-modules/sdk-client/controllers/sdk-client.controller';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity]),
    WorkspaceCacheModule,
    CoreGraphQLApiModule,
  ],
  controllers: [SdkClientController],
  providers: [SdkClientGenerationService, SdkClientArchiveService],
  exports: [SdkClientGenerationService, SdkClientArchiveService],
})
export class SdkClientModule {}
