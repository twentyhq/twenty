import { useContext } from 'react';

import {
  FrontComponentInputFocusContext,
  type SetEditableFocused,
} from '@/host/contexts/FrontComponentInputFocusContext';
import { useComposedElementRef } from '@/host/hooks/useComposedElementRef';
import { useGeometryNodeRef } from '@/host/hooks/useGeometryNodeRef';
import { useReactUnsupportedEventListenerRef } from '@/host/hooks/useReactUnsupportedEventListenerRef';
import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { buildHostReactPropsFromRemoteProps } from '@/host/utils/buildHostReactPropsFromRemoteProps';
import { createDropTargetGuardProps } from '@/host/utils/createDropTargetGuardProps';
import { extractReactUnsupportedEventHandlers } from '@/host/utils/extractReactUnsupportedEventHandlers';
import { getRemoteElementIdFromProps } from '@/host/utils/getRemoteElementIdFromProps';
import { preventDefaultThenForwardToRemote } from '@/host/utils/preventDefaultThenForwardToRemote';
import { sanitizeIframeSandbox } from '@/host/utils/sanitizeIframeSandbox';

type HtmlHostElementProps = {
  setEditableFocused: SetEditableFocused | null;
  reactBindableProps: Record<string, unknown>;
  hostEnforcedProps: Record<string, unknown>;
  composedElementRef: ElementRefCallback;
};

export const useHtmlHostElementProps = (
  props: Record<string, unknown>,
  htmlTag: string,
): HtmlHostElementProps => {
  const setEditableFocused = useContext(FrontComponentInputFocusContext);

  const remoteElementId = getRemoteElementIdFromProps(props);

  const { reactUnsupportedEventHandlers, reactBindableProps } =
    extractReactUnsupportedEventHandlers(
      buildHostReactPropsFromRemoteProps(props, htmlTag),
    );

  const reactUnsupportedEventListenerRef = useReactUnsupportedEventListenerRef(
    reactUnsupportedEventHandlers,
  );

  const geometryNodeRef = useGeometryNodeRef(remoteElementId);

  const composedElementRef = useComposedElementRef([
    reactUnsupportedEventListenerRef,
    geometryNodeRef,
  ]);

  const hostEnforcedProps: Record<string, unknown> = {
    ...createDropTargetGuardProps(reactBindableProps),
    ...(htmlTag === 'iframe' && {
      sandbox: sanitizeIframeSandbox(reactBindableProps.sandbox),
    }),
    // React 19 blocks the previous `action="javascript:void(0)"` guard.
    ...(htmlTag === 'form' && {
      onSubmit: preventDefaultThenForwardToRemote(reactBindableProps.onSubmit),
    }),
  };

  return {
    setEditableFocused,
    reactBindableProps,
    hostEnforcedProps,
    composedElementRef,
  };
};
