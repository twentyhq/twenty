import { isFunction, isNonEmptyString } from '@sniptt/guards';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type SetEditableFocused } from '@/host/contexts/FrontComponentInputFocusContext';
import { syncValuePreservingCaret } from '@/host/utils/syncValuePreservingCaret';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

type CreateCaretPreservingElementParams = {
  htmlTag: 'input' | 'textarea';
  reactBindableProps: Record<string, unknown>;
  hostEnforcedProps: Record<string, unknown> | undefined;
  setEditableFocused: SetEditableFocused | null;
  reactUnsupportedEventListenerRef?: (node: Element | null) => void;
};

export const createCaretPreservingElement = ({
  htmlTag,
  reactBindableProps,
  hostEnforcedProps,
  setEditableFocused,
  reactUnsupportedEventListenerRef,
}: CreateCaretPreservingElementParams) => {
  const {
    value,
    defaultValue,
    onFocus: forwardedOnFocus,
    onBlur: forwardedOnBlur,
    ...rest
  } = reactBindableProps;
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
    ...hostEnforcedProps,
    defaultValue: initialValue,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ref: (node: CaretPreservingElement | null) => {
      reactUnsupportedEventListenerRef?.(node);
      if (!isDefined(node)) {
        return;
      }
      if (isNonEmptyString(value)) {
        syncValuePreservingCaret(node, value);
      }
    },
  });
};
