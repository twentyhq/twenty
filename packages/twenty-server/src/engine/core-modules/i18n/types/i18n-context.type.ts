import { APP_LOCALES } from 'twenty-shared';

export type I18nContext = {
  req: {
    headers: {
      'x-locale': (typeof APP_LOCALES)[keyof typeof APP_LOCALES] | undefined;
    };
  };
};
