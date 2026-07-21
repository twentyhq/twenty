import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectLocale = (context: FrontComponentExecutionContext): AppLocale =>
  context.locale ?? SOURCE_LOCALE;

// Reactive locale of the host UI. Re-renders the component when the user
// switches language, mirroring useColorScheme.
export const useLocale = (): AppLocale => {
  return useFrontComponentExecutionContext(selectLocale);
};
