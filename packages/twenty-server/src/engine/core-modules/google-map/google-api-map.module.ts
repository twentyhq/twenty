import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { GoogleApiMapController } from 'src/engine/core-modules/google-map/controller/google-api-map.controller';
import { GoogleApiMapService } from 'src/engine/core-modules/google-map/services/google-api-map.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [HttpModule, WorkspaceCacheStorageModule, TokenModule],
  controllers: [GoogleApiMapController],
  providers: [GoogleApiMapService],
  exports: [],
})
export class GoogleApiMapModule {}
