import { selectorFamily } from 'recoil';

import { genericEntitiesFamilyState } from '../genericEntitiesFamilyState';

export const genericEntityFieldFamilySelector = selectorFamily({
  key: 'genericEntityFieldFamilySelector',
  get:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ get }) =>
      get(genericEntitiesFamilyState(entityId))?.[fieldName] as T,
  set:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ set }, newValue: T) =>
      set(genericEntitiesFamilyState(entityId), (prevState) => ({
        ...prevState,
        [fieldName]: newValue,
      })),
});
