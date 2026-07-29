import { isFunction, isNonEmptyString, isNumber } from '@sniptt/guards';
import React from 'react';

import { type SetEditableFocused } from '@/host/contexts/FrontComponentInputFocusContext';
import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

type CaretPreservingElement = HTMLInputElement | HTMLTextAreaElement;

const resolveInitialValue = (candidate: unknown): string | undefined => {
  if (isNonEmptyString(candidate)) {
    return candidate;
  }

  if (isNumber(candidate)) {
    return String(candidate);
  }

  return undefined;
};

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
  const initialValue =
    resolveInitialValue(defaultValue) ?? resolveInitialValue(value);

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
