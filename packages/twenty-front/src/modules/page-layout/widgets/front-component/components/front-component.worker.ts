import { createRemoteRoot } from '@/page-layout/widgets/front-component/utils/create-remote-root.utils';
import { ThreadWebWorker } from '@quilted/threads';
import type { RemoteConnection } from '@remote-dom/core/elements';
import '@remote-dom/core/polyfill';

type SandboxAPI = {
  render: (connection: RemoteConnection, sourceCode: string) => Promise<void>;
};

const executeFrontComponent = (sourceCode: string, rootElement: Element) => {
  const run = new Function('root', sourceCode) as (root: Element) => void;

  run(rootElement);
};

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, sourceCode: string) => {
    const rootElement = await createRemoteRoot();

    executeFrontComponent(sourceCode, rootElement);

    rootElement.connect(connection);
  },
});
