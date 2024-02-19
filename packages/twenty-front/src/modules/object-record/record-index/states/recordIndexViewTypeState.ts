import { atom } from 'recoil';

import { ViewType } from '@/views/types/ViewType';

export const recordIndexViewTypeState = atom<ViewType | undefined>({
  key: 'recordIndexViewTypeState',
  default: undefined,
});
