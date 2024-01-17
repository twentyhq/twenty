import { atomFamily } from 'recoil';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const entityFieldsFamilyState = atomFamily<ObjectRecord | null, string>({
  key: 'entityFieldsFamilyState',
  default: null,
});
