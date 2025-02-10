import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { I18nMiddleware } from 'src/engine/core-modules/i18n/i18n.middleware';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';

@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(I18nMiddleware).forRoutes('*');
  }
}
