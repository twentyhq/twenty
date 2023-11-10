import { atomFamily } from 'recoil';

import { FieldInitialValue } from '../types/FieldInitialValue';

export const entityFieldInitialValueFamilyState = atomFamily<
  FieldInitialValue | undefined,
  { entityId: string; fieldId: string }
>({
  key: 'entityFieldInitialValueFamilyState',
  default: undefined,
});
