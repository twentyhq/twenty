import { MUTATION_TYPE_UPDATE_PROPERTY, ROOT_ID } from '@remote-dom/core';
import {
  BatchingRemoteConnection,
  connectRemoteNode,
  setRemoteId,
  type RemoteConnection,
} from '@remote-dom/core/elements';

import { REMOTE_RENDER_CONTAINER_TAG } from '@/constants/RemoteRenderContainerTag';
import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { workerFocusTransport } from '@/polyfills/dom/states/workerFocusTransport';
import { installStyleBridge } from '@/polyfills/style/utils/installStyleBridge';

export const attachRemoteRenderRootToWorkerDocument = (
  connection: RemoteConnection,
): Element => {
  const batchedConnection = new BatchingRemoteConnection({
    call: connection.call,
    mutate: (records) =>
      connection.mutate(
        records.filter(([mutationType, remoteNodeId]) => {
          const isRootPropertyUpdate =
            mutationType === MUTATION_TYPE_UPDATE_PROPERTY &&
            remoteNodeId === ROOT_ID;

          return !isRootPropertyUpdate;
        }),
      ),
  });
  const remoteRoot = document.body;
  const renderContainer = document.createElement(REMOTE_RENDER_CONTAINER_TAG);

  setRemoteId(remoteRoot, ROOT_ID);
  connectRemoteNode(remoteRoot, batchedConnection);
  remoteRoot.append(renderContainer);
  workerGeometryStore.setRootElement(remoteRoot);
  workerFocusTransport.setRootElement(remoteRoot);
  installStyleBridge(remoteRoot);

  return renderContainer;
};
