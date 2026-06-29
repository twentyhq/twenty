import { type ReactNode } from 'react';

import { useLocale } from '../hooks/useLocale';
import {
  normalizeMessageWhitespace,
  type TranslationValues,
} from '../i18n/message';
import { resolveTranslation } from '../i18n/resolveTranslation';

export type TransProps = {
  children?: ReactNode;
  // Explicit source message; use this (with `values`) for interpolation instead
  // of inlining expressions in the children, which cannot be statically
  // extracted without a build-time macro.
  message?: string;
  context?: string;
  values?: TranslationValues;
};

const getSourceMessage = (
  message: string | undefined,
  children: ReactNode,
): string | undefined => {
  if (message !== undefined) {
    return message;
  }

  // Only plain static text children are translatable. Anything richer (nested
  // elements, interpolated expressions) is left untouched and should use the
  // `message`/`values` props.
  if (typeof children === 'string') {
    return normalizeMessageWhitespace(children);
  }

  return undefined;
};

// JSX translation for static text: <Trans>Save</Trans>, reactive to locale.
export const Trans = ({
  children,
  message,
  context,
  values,
}: TransProps): ReactNode => {
  const locale = useLocale();

  const sourceMessage = getSourceMessage(message, children);

  if (sourceMessage === undefined) {
    return children;
  }

  return resolveTranslation({ message: sourceMessage, context }, values, locale);
};
