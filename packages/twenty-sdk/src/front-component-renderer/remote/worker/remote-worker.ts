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
import { isDefined } from 'twenty-shared/utils';

import * as TwentySdk from '@/sdk';
import { setFrontComponentExecutionContext } from '@/sdk/front-component-api/context/frontComponentContext';
import { setNavigate } from '@/sdk/front-component-api/functions/navigate';

import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import * as RemoteComponents from '../generated/remote-components';
import { exposeGlobals } from '../utils/exposeGlobals';
import { setWorkerEnv } from './utils/setWorkerEnv';

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

  if (
    isDefined(renderContext.applicationAccessToken) &&
    isDefined(renderContext.apiUrl)
  ) {
    setWorkerEnv({
      TWENTY_APP_ACCESS_TOKEN: renderContext.applicationAccessToken,
      TWENTY_API_URL: renderContext.apiUrl,
    });
  }

  const response = await fetch(renderContext.componentUrl, {
    headers: isDefined(renderContext.applicationAccessToken)
      ? { Authorization: `Bearer ${renderContext.applicationAccessToken}` }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch front component from ${renderContext.componentUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const responseText = await response.text();

  const blob = new Blob([responseText], {
    type: 'application/javascript',
  });

  const importUrl = URL.createObjectURL(blob);

  try {
    /* @vite-ignore */
    const componentModule = await import(importUrl);

    const reactRoot = createRoot(root);
    reactRoot.render(componentModule.default);
  } catch (importError) {
    console.error(
      '[FrontComponentWorker] Failed to load or render component:',
      importError,
    );
    throw importError;
  } finally {
    URL.revokeObjectURL(importUrl);
  }
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
