import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { getFrontComponentExecutionContext } from '../context/frontComponentContext';
import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import {
  type MessageDescriptor,
  type TranslationValues,
} from './message';
import { resolveTranslation } from './resolveTranslation';

const getCurrentLocale = (): string => {
  // The execution context may be unset when t() runs at module scope before the
  // host has pushed it, so guard and fall back to the source locale.
  const context: FrontComponentExecutionContext | undefined =
    getFrontComponentExecutionContext();

  return context?.locale ?? SOURCE_LOCALE;
};

// Eager translation. Resolves against the active locale at call time, so it can
// be used anywhere — event handlers, helpers, module scope — not only in render.
export const t = (
  descriptor: string | MessageDescriptor,
  values?: TranslationValues,
): string => resolveTranslation(descriptor, values, getCurrentLocale());
