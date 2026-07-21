import { Module, type OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreGraphQLApiModule } from 'src/engine/api/graphql/core-graphql-api.module';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SdkClientController } from 'src/engine/core-modules/sdk-client/controllers/sdk-client.controller';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, WorkspaceEntity]),
    WorkspaceCacheModule,
    CoreGraphQLApiModule,
    ApplicationModule,
    MetricsModule,
  ],
  controllers: [SdkClientController],
  providers: [SdkClientGenerationService, SdkClientArchiveService],
  exports: [SdkClientGenerationService, SdkClientArchiveService],
})
export class SdkClientModule implements OnApplicationBootstrap {
  async onApplicationBootstrap(): Promise<void> {
    await getInstalledSdkMetadataModule();
  }
}
