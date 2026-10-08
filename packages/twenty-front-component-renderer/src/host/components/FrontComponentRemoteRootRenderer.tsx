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
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';

const PORTAL_LAYER_Z_INDEX = 38;

const PORTAL_LAYER_STYLE: CSSProperties = {
  position: 'fixed',
  contain: 'layout',
  zIndex: PORTAL_LAYER_Z_INDEX,
  pointerEvents: 'none',
  clipPath: `inset(calc(-${FRONT_COMPONENT_PORTAL_MARGIN}px / var(--t-zoom, 1)))`,
};

const PORTAL_CONTENT_STYLE: CSSProperties = {
  display: 'contents',
  pointerEvents: 'auto',
};

const isRemoteRenderContainer = (child: RemoteReceiverNode) =>
  child.type === NODE_TYPE_ELEMENT &&
  child.element === REMOTE_RENDER_CONTAINER_TAG;

export const FrontComponentRemoteRootRenderer = (
  props: FrontComponentRemoteRootRendererProps,
) => {
  const geometryTracker = useContext(FrontComponentGeometryTrackerContext);
  const root = useRemoteReceived(props.receiver.root, props.receiver);
  const children = root?.children ?? [];
  const renderContainers = children.filter(isRemoteRenderContainer);
  const portalChildren = children.filter(
    (child) => !isRemoteRenderContainer(child),
  );

  return (
    <>
      {renderContainers.map((child) => renderRemoteNode(child, props))}
      {isNonEmptyArray(portalChildren) &&
        createPortal(
          <div ref={geometryTracker?.setPortalLayer} style={PORTAL_LAYER_STYLE}>
            <div style={PORTAL_CONTENT_STYLE}>
              {portalChildren.map((child) => renderRemoteNode(child, props))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
