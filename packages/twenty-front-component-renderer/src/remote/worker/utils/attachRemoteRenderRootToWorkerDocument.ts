import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';

import { workerGeometryStore } from '@/polyfills/geometry/workerGeometryStore';
import { installStyleBridge } from '@/polyfills/installStyleBridge';

export const attachRemoteRenderRootToWorkerDocument = (
  connection: RemoteConnection,
): Element => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const remoteRoot = document.createElement('remote-root') as RemoteRootElement;
  const renderContainer = document.createElement('remote-fragment');

  remoteRoot.connect(batchedConnection);
  remoteRoot.append(renderContainer);
  document.body.append(remoteRoot);
  workerGeometryStore.setRootElement(remoteRoot);
  installStyleBridge(remoteRoot);

  return renderContainer;
};
