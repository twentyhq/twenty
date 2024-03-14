import { Module } from '@nestjs/common';

import { OpenApiController } from 'src/engine/features/open-api/open-api.controller';
import { OpenApiService } from 'src/engine/features/open-api/open-api.service';
import { AuthModule } from 'src/engine/features/auth/auth.module';
import { ObjectMetadataModule } from 'src/engine/api/metadata/object-metadata/object-metadata.module';

@Module({
  imports: [ObjectMetadataModule, AuthModule],
  controllers: [OpenApiController],
  providers: [OpenApiService],
})
export class OpenApiModule {}
