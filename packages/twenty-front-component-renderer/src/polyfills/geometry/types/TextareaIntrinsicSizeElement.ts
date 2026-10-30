import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export type TextareaIntrinsicSizeElement = SelectorElementLike & {
  isConnected?: boolean;
  style?: { blockSize: string };
};
