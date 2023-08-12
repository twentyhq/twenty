import { useRecoilCallback } from 'recoil';

import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';

export function useUpdateEntityTableItem() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(entity: T) => {
        const currentEntity = snapshot
          .getLoadable(tableEntitiesFamilyState(entity.id))
          .valueOrThrow();
        console.log('currentEntity', currentEntity);

        if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
          console.log(entity);
          set(tableEntitiesFamilyState(entity.id), entity);
        }
      },
    [],
  );
}
