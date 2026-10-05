import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type HostFetchFunction } from '@/types/HostFetchFunction';
import { type ImageLoadingHost } from '@/types/image/ImageLoadingHost';
import { type MediaSessionHostFunctions } from '@/types/MediaSession';

export type FrontComponentHostThreadExports =
  FrontComponentHostCommunicationApi &
    MediaSessionHostFunctions &
    Pick<ImageLoadingHost, 'loadImage' | 'cancelImage'> & {
      hostFetch: HostFetchFunction;
      observeElementGeometry: (remoteElementIds: string[]) => Promise<void>;
      unobserveElementGeometry: (remoteElementIds: string[]) => Promise<void>;
    };
