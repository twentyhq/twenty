export type ImageLoadResult = {
  status: 'loaded' | 'error' | 'cancelled';
  naturalWidth: number;
  naturalHeight: number;
};
