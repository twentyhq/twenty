import { atom } from 'recoil';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const mergeRecordsState = atom<ObjectRecord[]>({
  key: 'mergeRecordsState',
  default: [],
});
