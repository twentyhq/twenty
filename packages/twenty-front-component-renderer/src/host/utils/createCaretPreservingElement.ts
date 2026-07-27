import { isFunction, isNonEmptyString } from '@sniptt/guards';
import React from 'react';

import { type SetEditableFocused } from '@/host/contexts/FrontComponentInputFocusContext';
import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

type CreateCaretPreservingElementParams = {
  htmlTag: 'input' | 'textarea';
  reactBindableProps: Record<string, unknown>;
  hostEnforcedProps: Record<string, unknown>;
  setEditableFocused: SetEditableFocused | null;
  caretPreservingElementRef: ElementRefCallback;
};

export const createCaretPreservingElement = ({
  htmlTag,
  reactBindableProps,
  hostEnforcedProps,
  setEditableFocused,
  caretPreservingElementRef,
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
    ref: caretPreservingElementRef,
  });
};
