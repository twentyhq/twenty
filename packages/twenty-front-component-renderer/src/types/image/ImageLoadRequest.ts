export type ImageLoadRequest = {
  requestId: string;
  src: string | null;
  srcset: string | null;
  sizes: string;
  crossOrigin: string | null;
  referrerPolicy: string;
};
