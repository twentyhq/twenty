import { Injectable, type NestMiddleware } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { type NextFunction, type Request, type Response } from 'express';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

// TODO: this should be deprecated as singleton pattern won't work: user will keep changing locales for eachothers
@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const locale = req.locale;

    if (locale && Object.values(APP_LOCALES).includes(locale)) {
      i18n.activate(locale);
    } else {
      i18n.activate(SOURCE_LOCALE);
    }

    next();
  }
}
