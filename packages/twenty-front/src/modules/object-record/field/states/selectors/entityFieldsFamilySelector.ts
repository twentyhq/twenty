import { selectorFamily } from 'recoil';

import { entityFieldsFamilyState } from '../entityFieldsFamilyState';

export const entityFieldsFamilySelector = selectorFamily({
  key: 'entityFieldsFamilySelector',
  get:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ get }) =>
      get(entityFieldsFamilyState(entityId))?.[fieldName] as T,
  set:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ set }, newValue: T) =>
      set(entityFieldsFamilyState(entityId), (prevState) => ({
        ...prevState,
        [fieldName]: newValue,
      })),
});
