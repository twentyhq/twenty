import { type ImageLoadRequest } from '@/types/image/ImageLoadRequest';
import { type ImageLoadResult } from '@/types/image/ImageLoadResult';

export type ImageLoadingTransport = {
  loadImage: (request: ImageLoadRequest) => Promise<ImageLoadResult>;
  cancelImage: (requestId: string) => Promise<void>;
};
