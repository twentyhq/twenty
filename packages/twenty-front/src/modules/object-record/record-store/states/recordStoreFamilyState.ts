import { atomFamily } from 'recoil';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const recordStoreFamilyState = atomFamily<ObjectRecord | null, string>({
  key: 'recordStoreFamilyState',
  default: null,
});
