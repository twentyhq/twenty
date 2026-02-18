import { type RemoteConnection } from '@remote-dom/core/elements';
import { type FrontComponentExecutionContext } from './FrontComponentExecutionContext';
import { type HostToWorkerRenderContext } from './HostToWorkerRenderContext';

export type WorkerExports = {
  render: (
    connection: RemoteConnection,
    context: HostToWorkerRenderContext,
  ) => Promise<void>;
  initializeHostCommunicationApi: () => Promise<void>;
  updateContext: (context: FrontComponentExecutionContext) => Promise<void>;
};
