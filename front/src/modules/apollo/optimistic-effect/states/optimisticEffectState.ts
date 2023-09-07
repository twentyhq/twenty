import { atom } from 'recoil';

import { OptimisticEffect } from '../types/OptimisticEffect';

export const optimisticEffectState = atom<
  Record<string, OptimisticEffect<unknown, unknown>>
>({
  key: 'optimisticEffectState',
  default: {},
});
