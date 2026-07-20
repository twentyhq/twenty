import React, { useContext } from 'react';

import { FrontComponentInputFocusContext } from '@/host/contexts/FrontComponentInputFocusContext';
import { useReactUnsupportedEventListenerRef } from '@/host/hooks/useReactUnsupportedEventListenerRef';
import { buildHostReactPropsFromRemoteProps } from '@/host/utils/buildHostReactPropsFromRemoteProps';
import { createCaretPreservingElement } from '@/host/utils/createCaretPreservingElement';
import { createDropTargetGuardProps } from '@/host/utils/createDropTargetGuardProps';
import { extractReactUnsupportedEventHandlers } from '@/host/utils/extractReactUnsupportedEventHandlers';
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

    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers(
        buildHostReactPropsFromRemoteProps(props, htmlTag),
      );

    const reactUnsupportedEventListenerRef =
      useReactUnsupportedEventListenerRef(reactUnsupportedEventHandlers);

    // Props the host imposes over whatever the untrusted remote component sent.
    const hostEnforcedProps: Record<string, unknown> = {
      ...createDropTargetGuardProps(reactBindableProps),
      ...(isIframe && {
        sandbox: sanitizeIframeSandbox(reactBindableProps.sandbox),
      }),
      // A native form submission navigates away and closes the page, so it has
      // to be prevented on the host. (React 19 also blocks the previous
      // `action="javascript:void(0)"` guard.)
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
        reactUnsupportedEventListenerRef,
      });
    }

    return React.createElement(
      htmlTag,
      {
        ...reactBindableProps,
        ...hostEnforcedProps,
        ref: reactUnsupportedEventListenerRef,
      },
      isVoid ? undefined : children,
    );
  };
};
