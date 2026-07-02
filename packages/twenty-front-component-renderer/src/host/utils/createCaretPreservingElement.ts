import { isFunction, isNonEmptyString } from '@sniptt/guards';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type SetEditableFocused } from '@/host/contexts/FrontComponentInputFocusContext';
import { syncValuePreservingCaret } from '@/host/utils/syncValuePreservingCaret';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

export const createCaretPreservingElement = (
  htmlTag: 'input' | 'textarea',
  reactProps: Record<string, unknown>,
  forcedProps: Record<string, unknown> | undefined,
  setEditableFocused: SetEditableFocused | null,
) => {
  const {
    value,
    defaultValue,
    onFocus: forwardedOnFocus,
    onBlur: forwardedOnBlur,
    ...rest
  } = reactProps;
  const initialValue = isNonEmptyString(defaultValue)
    ? defaultValue
    : isNonEmptyString(value)
      ? value
      : undefined;

  const handleFocus = (event: React.FocusEvent<CaretPreservingElement>) => {
    setEditableFocused?.(true);
    if (isFunction(forwardedOnFocus)) {
      forwardedOnFocus(event);
    }
  };

  const handleBlur = (event: React.FocusEvent<CaretPreservingElement>) => {
    setEditableFocused?.(false);
    if (isFunction(forwardedOnBlur)) {
      forwardedOnBlur(event);
    }
  };

  return React.createElement(htmlTag, {
    ...rest,
    ...forcedProps,
    defaultValue: initialValue,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ref: (node: CaretPreservingElement | null) => {
      if (!isDefined(node)) {
        return;
      }
      if (isNonEmptyString(value)) {
        syncValuePreservingCaret(node, value);
      }
    },
  });
};
