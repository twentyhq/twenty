import { type RemoteConnection } from '@remote-dom/core/elements';
import {
  type CommandConfirmationModalResult,
  type FrontComponentExecutionContext,
} from 'twenty-sdk/front-component';
import { type CapturedPointerEventUpdate } from '@/types/CapturedPointerEventUpdate';
import { type FocusUpdate } from '@/types/FocusUpdate';
import { type GeometryUpdateBatch } from '@/types/GeometryUpdateBatch';
import { type HostToWorkerRenderContext } from '@/types/HostToWorkerRenderContext';
import { type MediaSessionEventBatch } from '@/types/MediaSession';
import { type OutsidePressEventData } from '@/types/OutsidePressEventData';
import { type SerializedEventData } from '@/types/SerializedEventData';

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
  pushFocusUpdate: (update: FocusUpdate) => Promise<void>;
  pushCapturedPointerEvent: (
    update: CapturedPointerEventUpdate,
  ) => Promise<void>;
  pushOutsidePressEvent: (eventData: OutsidePressEventData) => Promise<void>;
  pushOwnedPressEvent: (eventData: SerializedEventData) => Promise<void>;
  pushMediaSessionEvents: (batch: MediaSessionEventBatch) => Promise<void>;
};
