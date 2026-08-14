import {
  type AppPath,
  type SidePanelPages,
  type EnqueueSnackbarParams,
  type NavigateOptions,
} from 'twenty-shared/types';
import { type getAppPath } from 'twenty-shared/utils';

import { type FrontComponentStorageType } from '../types/FrontComponentStorageType';

export type NavigateFunction = <T extends AppPath>(
  to: T,
  params?: Parameters<typeof getAppPath<T>>[1],
  queryParams?: Record<string, any>,
  options?: NavigateOptions,
) => Promise<void>;

export type OpenSidePanelPageParams =
  | {
      page: SidePanelPages.ViewRecord;
      recordId: string;
      objectNameSingular: string;
      tab?: string;
      resetNavigationStack?: boolean;
    }
  | {
      page: SidePanelPages.EditRichText;
      recordId: string;
      objectNameSingular: string;
      fieldName?: string;
    }
  | {
      page: SidePanelPages.ComposeEmail;
      connectedAccountId: string;
      threadId?: string;
      defaultTo?: string;
      defaultSubject?: string;
      defaultInReplyTo?: string;
      pageTitle?: string;
      pageIcon?: string;
    }
  | {
      page: SidePanelPages.ViewFrontComponent;
      frontComponentId: string;
      recordId?: string;
      objectNameSingular?: string;
      pageTitle: string;
      pageIcon?: string;
      resetNavigationStack?: boolean;
    }
  | {
      page: SidePanelPages.AskAI;
      pageTitle: string;
      pageIcon?: string;
      shouldResetSearchState?: boolean;
      preprompt?: {
        text: string;
        mode?: 'PREFILL' | 'SEND';
        model?: 'FAST' | 'SMART';
      };
    }
  | {
      page: Exclude<
        SidePanelPages,
        | SidePanelPages.ViewRecord
        | SidePanelPages.EditRichText
        | SidePanelPages.ComposeEmail
        | SidePanelPages.ViewFrontComponent
        | SidePanelPages.AskAI
      >;
      pageTitle: string;
      pageIcon?: string;
      shouldResetSearchState?: boolean;
    };

export type OpenSidePanelPageFunction = (
  params: OpenSidePanelPageParams,
) => Promise<void>;

export type CommandConfirmationModalResult = 'confirm' | 'cancel';

export type CommandConfirmationModalAccent = 'default' | 'blue' | 'danger';

export type OpenCommandConfirmationModalFunction = (params: {
  title: string;
  subtitle: string;
  confirmButtonText?: string;
  confirmButtonAccent?: CommandConfirmationModalAccent;
}) => Promise<CommandConfirmationModalResult>;

export type UnmountFrontComponentFunction = () => Promise<void>;

export type EnqueueSnackbarFunction = (
  params: EnqueueSnackbarParams,
) => Promise<void>;

export type CloseSidePanelFunction = () => Promise<void>;

export type UpdateProgressFunction = (progress: number) => Promise<void>;

export type RequestAccessTokenRefreshFunction = () => Promise<string>;

export type CopyToClipboardFunction = (text: string) => Promise<void>;

export type MediaRecordingMediaType = 'audio' | 'video';

export type StartMediaRecordingParams = {
  mediaType: MediaRecordingMediaType;
  // The FILES field the recording is uploaded for. Required: a file uploaded
  // outside a field can never be attached to a record and would be orphaned.
  fieldMetadataId: string;
  maxDurationSeconds?: number;
};

export type RecordedMediaFile = {
  fileId: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  durationSeconds: number;
};

export type MediaRecordingFailureReason =
  | 'invalid-params'
  | 'permission-denied'
  | 'no-device'
  | 'device-in-use'
  | 'blocked'
  | 'busy'
  | 'upload-failed'
  | 'unknown';

export type StartMediaRecordingResult =
  | { status: 'started'; recordingId: string }
  | { status: 'failed'; reason: MediaRecordingFailureReason };

// 'cancelled' covers every way the recording can be gone by the time stop
// arrives: the app cancelled, the user pressed stop on the host indicator,
// or the id is stale.
export type StopMediaRecordingResult =
  | { status: 'captured'; file: RecordedMediaFile }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: MediaRecordingFailureReason };

export type StartMediaRecordingFunction = (
  params: StartMediaRecordingParams,
) => Promise<StartMediaRecordingResult>;

export type StopMediaRecordingFunction = (params: {
  recordingId: string;
}) => Promise<StopMediaRecordingResult>;

export type CancelMediaRecordingFunction = (params: {
  recordingId: string;
}) => Promise<void>;

export type OpenCommandConfirmationModalHostFunction = (
  params: Parameters<OpenCommandConfirmationModalFunction>[0],
) => Promise<void>;

export type StorageSetFunction = (params: {
  storageType: FrontComponentStorageType;
  key: string;
  serializedValue: string;
}) => Promise<void>;

export type StorageDeleteFunction = (params: {
  storageType: FrontComponentStorageType;
  key: string;
}) => Promise<void>;

export type StorageClearFunction = (params: {
  storageType: FrontComponentStorageType;
}) => Promise<void>;

export type FrontComponentHostCommunicationApiStore = {
  navigate?: NavigateFunction;
  requestAccessTokenRefresh?: RequestAccessTokenRefreshFunction;
  openSidePanelPage?: OpenSidePanelPageFunction;
  openCommandConfirmationModal?: OpenCommandConfirmationModalFunction;
  unmountFrontComponent?: UnmountFrontComponentFunction;
  enqueueSnackbar?: EnqueueSnackbarFunction;
  closeSidePanel?: CloseSidePanelFunction;
  updateProgress?: UpdateProgressFunction;
  copyToClipboard?: CopyToClipboardFunction;
  startMediaRecording?: StartMediaRecordingFunction;
  stopMediaRecording?: StopMediaRecordingFunction;
  cancelMediaRecording?: CancelMediaRecordingFunction;
  storageSet?: StorageSetFunction;
  storageDelete?: StorageDeleteFunction;
  storageClear?: StorageClearFunction;
};

import { FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY } from '../constants/front-component-host-communication-api-key';

declare global {
  var frontComponentHostCommunicationApi: FrontComponentHostCommunicationApiStore;
}

globalThis[FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY] ??= {};

export const frontComponentHostCommunicationApi =
  globalThis.frontComponentHostCommunicationApi;
