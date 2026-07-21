import React from 'react';

import { useCaretPreservingElementRef } from '@/host/hooks/useCaretPreservingElementRef';
import { useHtmlHostElementProps } from '@/host/hooks/useHtmlHostElementProps';
import { createCaretPreservingElement } from '@/host/utils/createCaretPreservingElement';
import { isTextLikeInputType } from '@/host/utils/isTextLikeInputType';

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
        useHtmlHostElementProps(props, htmlTag);

      return React.createElement(
        htmlTag,
        {
          ...reactBindableProps,
          ...hostEnforcedProps,
          ref: composedElementRef,
        },
        isVoid ? undefined : children,
      );
    };
  }

  const caretPreservingTag = htmlTag as 'input' | 'textarea';

  return ({ children, ...props }: WrapperProps) => {
    const {
      setEditableFocused,
      reactBindableProps,
      hostEnforcedProps,
      composedElementRef,
    } = useHtmlHostElementProps(props, htmlTag);

    const caretPreservingElementRef = useCaretPreservingElementRef(
      composedElementRef,
      reactBindableProps.value,
    );

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

    return React.createElement(
      htmlTag,
      {
        ...reactBindableProps,
        ...hostEnforcedProps,
        ref: composedElementRef,
      },
      isVoid ? undefined : children,
    );
  };
};
