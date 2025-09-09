import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';

import { getRequest } from 'src/utils/extract-request';

export const RequestLocale = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): keyof typeof APP_LOCALES | undefined => {
    const request = getRequest(ctx);

    return request.locale;
  },
);
