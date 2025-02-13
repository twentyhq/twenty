import { Injectable, NestMiddleware } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { NextFunction, Request, Response } from 'express';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const locale = req.headers['x-locale'] as keyof typeof APP_LOCALES;

    if (locale && Object.values(APP_LOCALES).includes(locale)) {
      i18n.activate(locale);
    } else {
      i18n.activate(SOURCE_LOCALE);
    }

    next();
  }
}
