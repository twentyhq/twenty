import { atomFamily } from 'recoil';

import { FieldInitialValue } from '../types/FieldInitialValue';

export const entityFieldInitialValueFamilyState = atomFamily<
  FieldInitialValue | undefined,
  { entityId: string; fieldMetadataId: string }
>({
  key: 'entityFieldInitialValueFamilyState',
  default: undefined,
});
