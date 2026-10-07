import { ROOT_ID } from '@remote-dom/core';
import {
  BatchingRemoteConnection,
  connectRemoteNode,
  setRemoteId,
  type RemoteConnection,
} from '@remote-dom/core/elements';

import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { workerFocusTransport } from '@/polyfills/dom/states/workerFocusTransport';
import { installStyleBridge } from '@/polyfills/style/utils/installStyleBridge';
import { createConnectionIgnoringRootPropertyUpdates } from '@/remote/worker/rendering/utils/createConnectionIgnoringRootPropertyUpdates';

export const attachRemoteRenderRootToWorkerDocument = (
  connection: RemoteConnection,
): Element => {
  const batchedConnection = new BatchingRemoteConnection(
    createConnectionIgnoringRootPropertyUpdates(connection),
  );
  const remoteRoot = document.body;
  const renderContainer = document.createElement(REMOTE_RENDER_CONTAINER_TAG);

  setRemoteId(remoteRoot, ROOT_ID);
  connectRemoteNode(remoteRoot, batchedConnection);
  remoteRoot.append(renderContainer);
  workerGeometryStore.setRootElement(remoteRoot);
  workerFocusTransport.setRootElement(remoteRoot);
  workerInputSelectionStore.setRootElement(remoteRoot);
  installStyleBridge(remoteRoot);

  return renderContainer;
};
