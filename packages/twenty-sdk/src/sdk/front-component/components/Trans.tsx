import { type ReactNode } from 'react';

import { useTranslate } from '../hooks/useTranslate';
import {
  normalizeMessageWhitespace,
  type TranslationValues,
} from '../translations/message';

export type TransProps = {
  children?: ReactNode;
  // Use with `values` for interpolation: inlined child expressions cannot be statically extracted
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
  const { t } = useTranslate();

  const sourceMessage = getSourceMessage(message, children);

  if (sourceMessage === undefined) {
    return children;
  }

  return t({ message: sourceMessage, context }, values);
};
