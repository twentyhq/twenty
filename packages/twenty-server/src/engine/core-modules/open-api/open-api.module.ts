import { Module } from '@nestjs/common';

import { OpenApiController } from 'src/engine/core-modules/open-api/open-api.controller';
import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  controllers: [OpenApiController],
  providers: [OpenApiService],
})
export class OpenApiModule {}
