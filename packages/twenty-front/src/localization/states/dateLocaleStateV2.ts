import { type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

type DateLocaleState = {
  locale?: keyof typeof APP_LOCALES;
  localeCatalog: Locale;
};

export const dateLocaleStateV2 = createStateV2<DateLocaleState>({
  key: 'dateLocaleStateV2',
  defaultValue: {
    locale: undefined,
    localeCatalog: enUS,
  },
});
