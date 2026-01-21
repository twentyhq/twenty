import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import { createRemoteRoot } from '@/page-layout/widgets/front-component/utils/createRemoteRoot.utils';
import { ThreadWebWorker } from '@quilted/threads';
import type { RemoteConnection } from '@remote-dom/core/elements';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

type SandboxAPI = {
  render: (connection: RemoteConnection, sourceCode: string) => Promise<void>;
};

const executeFrontComponent = (sourceCode: string, rootElement: Element) => {
  const run = new Function('root', 'React', 'ReactDOM', sourceCode);

  run(rootElement, React, ReactDOM);
};

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, sourceCode: string) => {
    const rootElement = await createRemoteRoot();

    executeFrontComponent(sourceCode, rootElement);

    rootElement.connect(connection);
  },
});
