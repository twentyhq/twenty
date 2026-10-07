import { NODE_TYPE_ELEMENT } from '@remote-dom/core';
import {
  renderRemoteNode,
  useRemoteReceived,
  type RemoteReceiverNode,
  type RemoteRootRendererProps as FrontComponentRemoteRootRendererProps,
} from '@remote-dom/react/host';
import { type CSSProperties, useContext } from 'react';
import { createPortal } from 'react-dom';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';
import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { ROOT_CONTAINER_STYLE } from '@/host/constants/RootContainerStyle';
import { FrontComponentPortalContainerContext } from '@/host/contexts/FrontComponentPortalContainerContext';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';

const REMOTE_STYLE_TAG = 'remote-style';
const PORTAL_LAYER_Z_INDEX = 38;

const PORTAL_LAYER_STYLE: CSSProperties = {
  ...ROOT_CONTAINER_STYLE,
  position: 'fixed',
  zIndex: PORTAL_LAYER_Z_INDEX,
  pointerEvents: 'none',
  clipPath: `inset(calc(-${FRONT_COMPONENT_PORTAL_MARGIN}px / var(--t-zoom, 1)))`,
};

const PORTAL_CONTENT_STYLE: CSSProperties = {
  display: 'contents',
  pointerEvents: 'auto',
};

export const FrontComponentRemoteRootRenderer = (
  props: FrontComponentRemoteRootRendererProps,
) => {
  const geometryTracker = useContext(FrontComponentGeometryTrackerContext);
  const portalContainer = useContext(FrontComponentPortalContainerContext);
  const root = useRemoteReceived(props.receiver.root, props.receiver);
  const children = root?.children ?? [];
  const isInlineRootChild = (child: RemoteReceiverNode) =>
    child.type === NODE_TYPE_ELEMENT &&
    (child.element === REMOTE_RENDER_CONTAINER_TAG ||
      child.element === REMOTE_STYLE_TAG);
  const inlineChildren = children.filter(isInlineRootChild);
  const portalChildren = children.filter((child) => !isInlineRootChild(child));

  return (
    <>
      {inlineChildren.map((child) => renderRemoteNode(child, props))}
      {isNonEmptyArray(portalChildren) &&
        createPortal(
          <div ref={geometryTracker?.setPortalLayer} style={PORTAL_LAYER_STYLE}>
            <div style={PORTAL_CONTENT_STYLE}>
              {portalChildren.map((child) => renderRemoteNode(child, props))}
            </div>
          </div>,
          portalContainer ?? document.body,
        )}
    </>
  );
};
