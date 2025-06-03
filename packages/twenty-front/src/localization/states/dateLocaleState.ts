import { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { APP_LOCALES } from 'twenty-shared/translations';
import { createState } from 'twenty-ui/utilities';

type DateLocaleState = {
  locale?: keyof typeof APP_LOCALES;
  localeCatalog: Locale;
};

export const dateLocaleState = createState<DateLocaleState>({
  key: 'dateLocaleState',
  defaultValue: {
    locale: undefined,
    localeCatalog: enUS,
  },
});
