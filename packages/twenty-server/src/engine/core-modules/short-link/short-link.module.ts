import { Module } from '@nestjs/common';

import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [TwentyOrmModule],
  providers: [ShortLinkService],
  exports: [ShortLinkService],
})
export class ShortLinkModule {}
