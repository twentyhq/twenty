import '@remote-dom/core/polyfill';
import '@remote-dom/react/polyfill';

import { createRemoteHtmlComponents } from '@/page-layout/widgets/front-component/utils/createRemoteHtmlComponents.util';
import { createRemoteRoot } from '@/page-layout/widgets/front-component/utils/createRemoteRoot.utils';
import { defineRemoteHtmlElements } from '@/page-layout/widgets/front-component/utils/defineRemoteHtmlElements.util';
import { ThreadWebWorker } from '@quilted/threads';
import type { RemoteConnection } from '@remote-dom/core/elements';
import type { ReactNode } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

type SandboxAPI = {
  render: (connection: RemoteConnection, sourceCode: string) => Promise<void>;
};

defineRemoteHtmlElements();

const remoteHtmlComponents = createRemoteHtmlComponents();

const createWrappedReact = () => {
  const wrappedCreateElement = (
    type: unknown,
    props: Record<string, unknown> | null,
    ...children: ReactNode[]
  ) => {
    // If type is a string (HTML element name), use our wrapped component
    if (typeof type === 'string' && type in remoteHtmlComponents) {
      return React.createElement(
        remoteHtmlComponents[type],
        props,
        ...children,
      );
    }

    return React.createElement(type as React.ElementType, props, ...children);
  };

  return {
    ...React,
    createElement: wrappedCreateElement,
  };
};

const WrappedReact = createWrappedReact();

const executeFrontComponent = (sourceCode: string, rootElement: Element) => {
  const run = new Function('root', 'React', 'ReactDOM', sourceCode);

  run(rootElement, WrappedReact, ReactDOM);
};

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, sourceCode: string) => {
    const rootElement = await createRemoteRoot();

    executeFrontComponent(sourceCode, rootElement);

    rootElement.connect(connection);
  },
});
