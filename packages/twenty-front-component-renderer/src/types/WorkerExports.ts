import { type RemoteConnection } from '@remote-dom/core/elements';
import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';
import { type FrontComponentExecutionContext } from './FrontComponentExecutionContext';
import { type GeometryUpdateBatch } from './GeometryUpdateBatch';
import { type HostToWorkerRenderContext } from './HostToWorkerRenderContext';

export type WorkerExports = {
  render: (
    connection: RemoteConnection,
    context: HostToWorkerRenderContext,
  ) => Promise<void>;
  initializeHostCommunicationApi: () => Promise<void>;
  updateContext: (context: FrontComponentExecutionContext) => Promise<void>;
  onConfirmationModalResult: (
    result: CommandConfirmationModalResult,
  ) => Promise<void>;
  pushGeometryUpdates: (batch: GeometryUpdateBatch) => Promise<void>;
};
