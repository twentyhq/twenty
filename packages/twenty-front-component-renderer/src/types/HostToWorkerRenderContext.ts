import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { type SdkClientSources } from '@/types/SdkClientSources';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export type HostToWorkerRenderContext = {
  componentUrl: string;
  componentSource: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientSources?: SdkClientSources;
  hostFetchOrigins?: string[];
  applicationVariables?: Record<string, string>;
  initialViewportGeometry?: ViewportGeometrySnapshot;
  storageSnapshots?: Record<FrontComponentStorageArea, Record<string, string>>;
};
