import { Global, Module } from '@nestjs/common';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';

@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
