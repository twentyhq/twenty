import { useContext } from 'react';

import {
  FrontComponentInputFocusContext,
  type SetEditableFocused,
} from '@/host/caret/contexts/FrontComponentInputFocusContext';
import { useComposedElementRef } from '@/host/elements/hooks/useComposedElementRef';
import { useGeometryNodeRef } from '@/host/geometry/hooks/useGeometryNodeRef';
import { useReactUnsupportedEventListenerRef } from '@/host/events/hooks/useReactUnsupportedEventListenerRef';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { buildHostReactPropsFromRemoteProps } from '@/host/elements/utils/buildHostReactPropsFromRemoteProps';
import { createDropTargetGuardProps } from '@/host/elements/utils/createDropTargetGuardProps';
import { extractReactUnsupportedEventHandlers } from '@/host/events/utils/extractReactUnsupportedEventHandlers';
import { getRemoteElementIdFromProps } from '@/host/elements/utils/getRemoteElementIdFromProps';
import { preventDefaultThenForwardToRemote } from '@/host/events/utils/preventDefaultThenForwardToRemote';
import { sanitizeIframeSandbox } from '@/host/elements/utils/sanitizeIframeSandbox';

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
