import { Module } from '@nestjs/common';

import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';

@Module({
  providers: [ShortLinkService],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}
