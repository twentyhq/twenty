import { atom } from 'recoil';
import { undefined } from 'zod';

export const currentPipelineState = atom<any | undefined>({
  key: 'currentPipelineState',
  default: undefined,
});
