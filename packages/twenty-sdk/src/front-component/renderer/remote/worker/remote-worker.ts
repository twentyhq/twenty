import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsx, jsxs } from 'react/jsx-runtime';
import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import { frontComponentExecutionContextStore } from '../context/FrontComponentExecutionContextStore';
import * as RemoteComponents from '../generated/remote-components';

(globalThis as Record<string, unknown>).React = React;
(globalThis as Record<string, unknown>).RemoteComponents = RemoteComponents;
(globalThis as Record<string, unknown>).jsx = jsx;
(globalThis as Record<string, unknown>).jsxs = jsxs;
(globalThis as Record<string, unknown>).frontComponentExecutionContextStore =
  frontComponentExecutionContextStore;

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  renderContext: HostToWorkerRenderContext,
) => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  root.connect(batchedConnection);
  document.body.append(root);

  /* @vite-ignore */
  const componentModule = await import(renderContext.componentUrl);

  const reactRoot = createRoot(root);
  reactRoot.render(componentModule.default);
};

const updateContext: WorkerExports['updateContext'] = async (
  context: FrontComponentExecutionContext,
) => {
  frontComponentExecutionContextStore.setContext(context);
};

ThreadWebWorker.self.export({ render, updateContext });
