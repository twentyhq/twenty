import { type ImageLoadingTransport } from '@/types/image/ImageLoadingTransport';

export type ImageLoadingHost = ImageLoadingTransport & {
  dispose: () => void;
};
