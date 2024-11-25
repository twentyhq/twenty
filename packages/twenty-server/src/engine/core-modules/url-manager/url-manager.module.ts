import { Module } from '@nestjs/common';

import { UrlManagerService } from 'src/engine/core-modules/url-manager/service/url-manager.service';

@Module({
  imports: [],
  providers: [UrlManagerService],
  exports: [UrlManagerService],
})
export class UrlManagerModule {}
