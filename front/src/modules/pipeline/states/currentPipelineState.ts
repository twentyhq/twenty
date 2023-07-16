import { atom } from 'recoil';

import { Pipeline } from '~/generated/graphql';

export const currentPipelineState = atom<Pipeline | undefined>({
  key: 'currentPipelineState',
  default: undefined,
});
