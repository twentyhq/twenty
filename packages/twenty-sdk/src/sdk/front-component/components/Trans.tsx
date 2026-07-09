import { type ReactNode } from 'react';

import { useLocale } from '../hooks/useLocale';
import {
  normalizeMessageWhitespace,
  type TranslationValues,
} from '../translations/message';
import { resolveTranslation } from '../translations/resolveTranslation';

export type TransProps = {
  children?: ReactNode;
  // Use this (with `values`) for interpolation; inlined child expressions
  // cannot be statically extracted.
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

  if (typeof children === 'string') {
    return normalizeMessageWhitespace(children);
  }

  return undefined;
};

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

  return resolveTranslation(
    { message: sourceMessage, context },
    values,
    locale,
  );
};
