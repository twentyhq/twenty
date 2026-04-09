import { type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

type DateLocaleState = {
  locale?: keyof typeof APP_LOCALES;
  localeCatalog: Locale;
};

export const dateLocaleState = createAtomState<DateLocaleState>({
  key: 'dateLocaleState',
  defaultValue: {
    locale: undefined,
    localeCatalog: enUS,
  },
});
