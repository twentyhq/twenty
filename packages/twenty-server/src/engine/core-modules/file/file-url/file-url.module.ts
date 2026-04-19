import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

import { FileUrlService } from './file-Url.service';

@Module({
  imports: [JwtModule],
  providers: [FileUrlService],
  exports: [FileUrlService],
})
export class FileUrlModule {}
