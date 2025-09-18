import { Injectable, NestMiddleware } from '@nestjs/common';

import { i18n } from '@lingui/core';
import { NextFunction, Request, Response } from 'express';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    //  Khi đã login dùng local trong table userWorkspace,workspaceMember (Độ ưu tiên sẽ cao hơn x-locale)
    // Ngôn ngữ mặc định là en
    //  Khi chưa login ngôn ngữ được set bằng x-locale gửi kèm trong header (Định dạng: vi-VN) 
    const locale = req.locale;
    if (locale && Object.values(APP_LOCALES).includes(locale)) {
      i18n.activate(locale);
    } else {
      i18n.activate(SOURCE_LOCALE);
    }
    next();
  }
}
