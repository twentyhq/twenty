import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { FileUrlService } from './file-url.service';

@Module({
  imports: [CoreEntityCacheModule, JwtModule],
  providers: [FileUrlService],
  exports: [FileUrlService],
})
export class FileUrlModule {}
