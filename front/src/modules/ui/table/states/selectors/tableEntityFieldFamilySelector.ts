import { selectorFamily } from 'recoil';

import { tableEntitiesFamilyState } from '../tableEntitiesFamilyState';

export const tableEntityFieldFamilySelector = selectorFamily({
  key: 'tableEntityFieldFamilySelector',
  get:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ get }) =>
      get(tableEntitiesFamilyState(entityId))?.[fieldName] as T,
  set:
    <T>({ fieldName, entityId }: { fieldName: string; entityId: string }) =>
    ({ set }, newValue: T) =>
      set(tableEntitiesFamilyState(entityId), (prevState) => ({
        ...prevState,
        [fieldName]: newValue,
      })),
});
