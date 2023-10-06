import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/field/states/entityFieldsFamilyState';

export const useUpsertEntityTableItem = () =>
  useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(entity: T) => {
        const currentEntity = snapshot
          .getLoadable(entityFieldsFamilyState(entity.id))
          .valueOrThrow();

        if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
          set(entityFieldsFamilyState(entity.id), entity);
        }
      },
    [],
  );
