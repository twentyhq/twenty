import { atom } from 'recoil';

import { OptimisticEffect } from '../types/OptimisticEffect';

export const optimisticEffectState = atom<
  Record<string, OptimisticEffect<any, any>>
>({
  key: 'optimisticEffectState',
  default: {},
});
