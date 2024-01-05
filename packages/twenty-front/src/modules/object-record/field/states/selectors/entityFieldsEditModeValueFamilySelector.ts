import { selectorFamily } from 'recoil';

import { entityFieldsEditModeValueFamilyState } from '@/object-record/field/states/entityFieldsEditModeValueFamilyState';

export const entityFieldsEditModeValueFamilySelector = selectorFamily({
  key: 'entityFieldsEditModeValueFamilySelector',
  get:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ get }) =>
      get(entityFieldsEditModeValueFamilyState(entityId))?.[fieldName] as T,
  set:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ set }, newValue: T) =>
      set(entityFieldsEditModeValueFamilyState(entityId), (prevState) => ({
        ...prevState,
        [fieldName]: newValue,
      })),
});
