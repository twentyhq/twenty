import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';

import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { workerFocusTransport } from '@/polyfills/dom/states/workerFocusTransport';
import { installStyleBridge } from '@/polyfills/style/utils/installStyleBridge';

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
  workerFocusTransport.setRootElement(remoteRoot);
  workerInputSelectionStore.setRootElement(remoteRoot);
  installStyleBridge(remoteRoot);

  return renderContainer;
};
