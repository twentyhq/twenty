import { NODE_TYPE_ELEMENT } from '@remote-dom/core';
import {
  renderRemoteNode,
  useRemoteReceived,
  type RemoteRootRendererProps as FrontComponentRemoteRootRendererProps,
} from '@remote-dom/react/host';
import { type CSSProperties } from 'react';

import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';

const PORTAL_LAYER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

const PORTAL_CONTENT_STYLE: CSSProperties = {
  display: 'contents',
  pointerEvents: 'auto',
};

export const FrontComponentRemoteRootRenderer = (
  props: FrontComponentRemoteRootRendererProps,
) => {
  const root = useRemoteReceived(props.receiver.root, props.receiver);
  const children = root?.children ?? [];
  const renderContainers = children.filter(
    (child) =>
      child.type === NODE_TYPE_ELEMENT &&
      child.element === REMOTE_RENDER_CONTAINER_TAG,
  );
  const portalChildren = children.filter(
    (child) =>
      child.type !== NODE_TYPE_ELEMENT ||
      child.element !== REMOTE_RENDER_CONTAINER_TAG,
  );

  return (
    <>
      {renderContainers.map((child) => renderRemoteNode(child, props))}
      <div style={PORTAL_LAYER_STYLE}>
        <div style={PORTAL_CONTENT_STYLE}>
          {portalChildren.map((child) => renderRemoteNode(child, props))}
        </div>
      </div>
    </>
  );
};
