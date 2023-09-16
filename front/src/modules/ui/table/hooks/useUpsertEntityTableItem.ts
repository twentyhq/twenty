import { useRecoilCallback } from 'recoil';

import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';

export const useUpsertEntityTableItem = () =>
  useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(entity: T) => {
        const currentEntity = snapshot
          .getLoadable(tableEntitiesFamilyState(entity.id))
          .valueOrThrow();

        if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
          set(tableEntitiesFamilyState(entity.id), entity);
        }
      },
    [],
  );
