import { isArray } from '@sniptt/guards';
import React from 'react';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { useCaretPreservingElementRef } from '@/host/caret/hooks/useCaretPreservingElementRef';
import { useHtmlHostElementProps } from '@/host/elements/hooks/useHtmlHostElementProps';
import { createCaretPreservingElement } from '@/host/caret/utils/createCaretPreservingElement';
import { createPlainHostElement } from '@/host/elements/utils/createPlainHostElement';
import { isFileInputType } from '@/host/elements/utils/isFileInputType';
import { isTextLikeInputType } from '@/utils/isTextLikeInputType';

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const CARET_PRESERVING_TAGS = new Set(['input', 'textarea']);

type WrapperProps = { children?: React.ReactNode } & Record<string, unknown>;

export const createHtmlHostWrapper = (htmlTag: string) => {
  const isVoid = VOID_ELEMENTS.has(htmlTag);

  if (!CARET_PRESERVING_TAGS.has(htmlTag)) {
    return ({ children, ...props }: WrapperProps) => {
      const { reactBindableProps, hostEnforcedProps, composedElementRef } =
        useHtmlHostElementProps({ props, htmlTag });

      const { value, ...reactBindablePropsWithoutValue } = reactBindableProps;

      const shouldUseOptionSelectedState =
        htmlTag === 'select' &&
        reactBindableProps.multiple === true &&
        !isArray(value);

      return createPlainHostElement({
        htmlTag,
        isVoid,
        reactBindableProps: shouldUseOptionSelectedState
          ? reactBindablePropsWithoutValue
          : reactBindableProps,
        hostEnforcedProps,
        composedElementRef,
        children,
      });
    };
  }

  const caretPreservingTag = htmlTag as 'input' | 'textarea';

  return ({
    children,
    [INPUT_SELECTION_BRIDGE_PROPERTIES.request]: selectionCommands,
    [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    ...props
  }: WrapperProps) => {
    const {
      setEditableFocused,
      reactBindableProps,
      hostEnforcedProps,
      composedElementRef,
    } = useHtmlHostElementProps({ props, htmlTag });

    const { value, ...reactBindablePropsWithoutValue } = reactBindableProps;

    const isFileInput = isFileInputType(reactBindableProps.type);

    const shouldClearFileInputSelection = isFileInput && value === '';

    const caretPreservingElementRef = useCaretPreservingElementRef({
      composedElementRef,
      value: isFileInput && !shouldClearFileInputSelection ? undefined : value,
      selectionCommands,
      onSelectionUpdate,
    });

    if (
      caretPreservingTag === 'textarea' ||
      isTextLikeInputType(reactBindableProps.type)
    ) {
      return createCaretPreservingElement({
        htmlTag: caretPreservingTag,
        reactBindableProps,
        hostEnforcedProps,
        setEditableFocused,
        caretPreservingElementRef,
      });
    }

    return createPlainHostElement({
      htmlTag,
      isVoid,
      reactBindableProps: isFileInput
        ? reactBindablePropsWithoutValue
        : reactBindableProps,
      hostEnforcedProps,
      composedElementRef: isFileInput
        ? caretPreservingElementRef
        : composedElementRef,
      children,
    });
  };
};
