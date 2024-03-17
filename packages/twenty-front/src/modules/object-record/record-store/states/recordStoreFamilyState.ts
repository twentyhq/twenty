import { createFamilyState } from 'twenty-ui';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const recordStoreFamilyState = createFamilyState<
  ObjectRecord | null,
  string
>({
  key: 'recordStoreFamilyState',
  defaultValue: null,
});
