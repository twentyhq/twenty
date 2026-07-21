import React, { useContext } from 'react';

import { FrontComponentInputFocusContext } from '@/host/contexts/FrontComponentInputFocusContext';
import { useCaretPreservingElementRef } from '@/host/hooks/useCaretPreservingElementRef';
import { useComposedElementRef } from '@/host/hooks/useComposedElementRef';
import { useGeometryNodeRef } from '@/host/hooks/useGeometryNodeRef';
import { useReactUnsupportedEventListenerRef } from '@/host/hooks/useReactUnsupportedEventListenerRef';
import { buildHostReactPropsFromRemoteProps } from '@/host/utils/buildHostReactPropsFromRemoteProps';
import { createCaretPreservingElement } from '@/host/utils/createCaretPreservingElement';
import { createDropTargetGuardProps } from '@/host/utils/createDropTargetGuardProps';
import { extractReactUnsupportedEventHandlers } from '@/host/utils/extractReactUnsupportedEventHandlers';
import { getRemoteElementIdFromProps } from '@/host/utils/getRemoteElementIdFromProps';
import { isTextLikeInputType } from '@/host/utils/isTextLikeInputType';
import { preventDefaultThenForwardToRemote } from '@/host/utils/preventDefaultThenForwardToRemote';
import { sanitizeIframeSandbox } from '@/host/utils/sanitizeIframeSandbox';

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

type WrapperProps = { children?: React.ReactNode } & Record<string, unknown>;

export const createHtmlHostWrapper = (htmlTag: string) => {
  const isVoid = VOID_ELEMENTS.has(htmlTag);
  const isIframe = htmlTag === 'iframe';
  const isForm = htmlTag === 'form';

  return ({ children, ...props }: WrapperProps) => {
    const setEditableFocused = useContext(FrontComponentInputFocusContext);

    const remoteElementId = getRemoteElementIdFromProps(props);

    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers(
        buildHostReactPropsFromRemoteProps(props, htmlTag),
      );

    const reactUnsupportedEventListenerRef =
      useReactUnsupportedEventListenerRef(reactUnsupportedEventHandlers);

    const geometryNodeRef = useGeometryNodeRef(remoteElementId);

    const composedElementRef = useComposedElementRef([
      reactUnsupportedEventListenerRef,
      geometryNodeRef,
    ]);

    const caretPreservingElementRef = useCaretPreservingElementRef(
      composedElementRef,
      reactBindableProps.value,
    );

    const hostEnforcedProps: Record<string, unknown> = {
      ...createDropTargetGuardProps(reactBindableProps),
      ...(isIframe && {
        sandbox: sanitizeIframeSandbox(reactBindableProps.sandbox),
      }),
      // React 19 blocks the previous `action="javascript:void(0)"` guard.
      ...(isForm && {
        onSubmit: preventDefaultThenForwardToRemote(
          reactBindableProps.onSubmit,
        ),
      }),
    };

    if (
      htmlTag === 'textarea' ||
      (htmlTag === 'input' && isTextLikeInputType(reactBindableProps.type))
    ) {
      return createCaretPreservingElement({
        htmlTag,
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
