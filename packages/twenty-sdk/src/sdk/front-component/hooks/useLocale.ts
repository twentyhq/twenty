import { SOURCE_LOCALE, type AppLocale } from 'twenty-shared/translations';

import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectLocale = (context: FrontComponentExecutionContext): AppLocale =>
  context.locale ?? SOURCE_LOCALE;

// Re-renders when the user switches language, like useColorScheme
export const useLocale = (): AppLocale => {
  return useFrontComponentExecutionContext(selectLocale);
};
