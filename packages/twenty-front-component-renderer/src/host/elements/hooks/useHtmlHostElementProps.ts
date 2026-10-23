import { useContext } from 'react';

import { SCROLL_BRIDGE_PROPERTIES } from '@/constants/ScrollBridgeProperties';
import { FrontComponentInputFocusContext } from '@/host/caret/contexts/FrontComponentInputFocusContext';
import { FrontComponentPointerCaptureControllerContext } from '@/host/events/contexts/FrontComponentPointerCaptureControllerContext';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { type SetEditableFocused } from '@/host/caret/types/SetEditableFocused';
import { useComposedElementRef } from '@/host/elements/hooks/useComposedElementRef';
import { useGeometryNodeRef } from '@/host/geometry/hooks/useGeometryNodeRef';
import { useReactUnsupportedEventListenerRef } from '@/host/events/hooks/useReactUnsupportedEventListenerRef';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { buildHostReactPropsFromRemoteProps } from '@/host/elements/utils/buildHostReactPropsFromRemoteProps';
import { createDropTargetGuardProps } from '@/host/elements/utils/createDropTargetGuardProps';
import { createSliderPointerCaptureProps } from '@/host/elements/utils/createSliderPointerCaptureProps';
import { createResizableSeparatorProps } from '@/host/elements/utils/createResizableSeparatorProps';
import { extractReactUnsupportedEventHandlers } from '@/host/events/utils/extractReactUnsupportedEventHandlers';
import { getRemoteElementIdFromProps } from '@/host/elements/utils/getRemoteElementIdFromProps';
import { preventDefaultThenForwardToRemote } from '@/host/events/utils/preventDefaultThenForwardToRemote';
import { sanitizeIframeSandbox } from '@/host/elements/utils/sanitizeIframeSandbox';
import { useRetryPendingHostFocus } from '@/host/focus/hooks/useRetryPendingHostFocus';
import { useHostScrollCommands } from '@/host/scroll/hooks/useHostScrollCommands';

type HtmlHostElementProps = {
  setEditableFocused: SetEditableFocused | null;
  reactBindableProps: Record<string, unknown>;
  hostEnforcedProps: Record<string, unknown>;
  composedElementRef: ElementRefCallback;
};

export const useHtmlHostElementProps = ({
  props,
  htmlTag,
}: {
  props: Record<string, unknown>;
  htmlTag: string;
}): HtmlHostElementProps => {
  const setEditableFocused = useContext(FrontComponentInputFocusContext);
  const geometryTracker = useContext(FrontComponentGeometryTrackerContext);
  const pointerCaptureController = useContext(
    FrontComponentPointerCaptureControllerContext,
  );

  const {
    [SCROLL_BRIDGE_PROPERTIES.request]: scrollCommands,
    [SCROLL_BRIDGE_PROPERTIES.update]: onScrollUpdate,
    ...remoteProps
  } = props;

  const remoteElementId = getRemoteElementIdFromProps(remoteProps);

  const { reactUnsupportedEventHandlers, reactBindableProps } =
    extractReactUnsupportedEventHandlers(
      buildHostReactPropsFromRemoteProps({
        remoteProps,
        htmlTag,
        findRemoteElementIdContainingNode:
          geometryTracker?.findRemoteElementIdContainingNode,
        claimPointerEventForwarding:
          pointerCaptureController?.claimPointerEventForwarding,
      }),
    );

  const reactUnsupportedEventListenerRef = useReactUnsupportedEventListenerRef(
    reactUnsupportedEventHandlers,
  );

  const geometryNodeRef = useGeometryNodeRef(remoteElementId);

  useRetryPendingHostFocus();

  useHostScrollCommands({ remoteElementId, scrollCommands, onScrollUpdate });

  const composedElementRef = useComposedElementRef([
    reactUnsupportedEventListenerRef,
    geometryNodeRef,
  ]);

  const hostEnforcedProps: Record<string, unknown> = {
    ...createDropTargetGuardProps(reactBindableProps),
    ...createResizableSeparatorProps(reactBindableProps),
    ...createSliderPointerCaptureProps({
      reactBindableProps,
      pointerCaptureController,
    }),
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
