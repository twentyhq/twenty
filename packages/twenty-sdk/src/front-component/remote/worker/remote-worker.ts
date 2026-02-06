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
import * as TwentySharedTypes from 'twenty-shared/types';
import * as TwentySharedUtils from 'twenty-shared/utils';

import { setFrontComponentExecutionContext } from '@/sdk/front-component-api/context/frontComponentContext';
import { setNavigate } from '@/sdk/front-component-api/functions/navigate';
import * as TwentySdk from '@/sdk';

import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import * as RemoteComponents from '../generated/remote-components';
import { exposeGlobals } from '../utils/exposeGlobals';

exposeGlobals({
  React,
  RemoteComponents,
  jsx,
  jsxs,
  TwentySdk,
  TwentyShared: {
    utils: TwentySharedUtils,
    types: TwentySharedTypes,
  },
});

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

const initializeHostCommunicationApi: WorkerExports['initializeHostCommunicationApi'] =
  async () => {
    const hostApi =
      ThreadWebWorker.self.import<FrontComponentHostCommunicationApi>();
    setNavigate(hostApi.navigate);
  };

const updateContext: WorkerExports['updateContext'] = async (
  context: FrontComponentExecutionContext,
) => {
  setFrontComponentExecutionContext(context);
};

ThreadWebWorker.self.export({
  render,
  initializeHostCommunicationApi,
  updateContext,
});
