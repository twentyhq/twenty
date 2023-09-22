import { atomFamily } from 'recoil';

export const fieldValueForPersistFamilyState = atomFamily<
  any,
  { entityId: string; fieldName: string }
>({
  key: 'fieldValueForPersistFamilyState',
  default: null,
});
