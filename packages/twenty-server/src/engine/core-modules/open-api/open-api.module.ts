import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { OpenApiController } from 'src/engine/core-modules/open-api/open-api.controller';
import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [
    ObjectMetadataModule,
    AuthModule,
    FeatureFlagModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  controllers: [OpenApiController],
  providers: [OpenApiService],
})
export class OpenApiModule {}
