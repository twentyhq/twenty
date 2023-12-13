import { Module } from '@nestjs/common';

import { OpenApiController } from 'src/core/open-api/open-api.controller';
import { OpenApiService } from 'src/core/open-api/open-api.service';
import { AuthModule } from 'src/core/auth/auth.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  controllers: [OpenApiController],
  providers: [OpenApiService],
})
export class OpenApiModule {}
