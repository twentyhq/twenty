import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import '../generated/remote-elements';

import { ThreadWebWorker } from '@quilted/threads';
import {
  BatchingRemoteConnection,
  type RemoteConnection,
  type RemoteRootElement,
} from '@remote-dom/core/elements';

import { isDefined } from 'twenty-shared/utils';

import { installStyleBridge } from '@/front-component-renderer/polyfills/installStyleBridge';
import { installStylePropertyOnRemoteElements } from '@/front-component-renderer/remote/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementSetAttribute } from '@/front-component-renderer/remote/utils/patchRemoteElementSetAttribute';
import { HTML_TAG_TO_CUSTOM_ELEMENT_TAG } from '@/sdk/front-component-api/constants/HtmlTagToRemoteComponent';
import { setFrontComponentExecutionContext } from '@/sdk/front-component-api/context/frontComponentContext';
import { setNavigate } from '@/sdk/front-component-api/functions/navigate';

import { type FrontComponentExecutionContext } from '../../types/FrontComponentExecutionContext';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type HostToWorkerRenderContext } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import { exposeGlobals } from '../utils/exposeGlobals';
import { setWorkerEnv } from './utils/setWorkerEnv';

installStylePropertyOnRemoteElements();
patchRemoteElementSetAttribute();

exposeGlobals({
  __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
});

const render: WorkerExports['render'] = async (
  connection: RemoteConnection,
  renderContext: HostToWorkerRenderContext,
) => {
  const batchedConnection = new BatchingRemoteConnection(connection);
  const root = document.createElement('remote-root') as RemoteRootElement;
  const renderContainer = document.createElement('remote-fragment');
  root.connect(batchedConnection);
  root.append(renderContainer);
  document.body.append(root);
  installStyleBridge(root);

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

    componentModule.default(renderContainer);
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
