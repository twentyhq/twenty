import { type FrontComponentStorageSnapshots } from '@/types/FrontComponentStorageSnapshots';
import { type MediaRecorderCapabilities } from '@/types/MediaSession';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type HostToWorkerRenderContext = {
  componentUrl: string;
  componentSource: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientSources?: SdkClientSources;
  sharedDependenciesSource?: string;
  hostFetchOrigins?: string[];
  applicationVariables?: Record<string, string>;
  initialViewportGeometry?: ViewportGeometrySnapshot;
  storageSnapshots?: FrontComponentStorageSnapshots;
  // MediaRecorder.isTypeSupported is synchronous, so the worker polyfill
  // answers from this snapshot instead of a round trip to the host.
  mediaRecorderCapabilities?: MediaRecorderCapabilities;
};
