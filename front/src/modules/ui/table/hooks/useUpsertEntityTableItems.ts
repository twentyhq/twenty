import { useRecoilCallback } from 'recoil';

import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';

export const useUpsertEntityTableItems = () =>
  useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(entities: T[]) => {
        // Create a map of new entities for quick lookup.
        const newEntityMap = new Map(
          entities.map((entity) => [entity.id, entity]),
        );

        // Filter out entities that are already the same in the state.
        const entitiesToUpdate = entities.filter((entity) => {
          const currentEntity = snapshot
            .getLoadable(tableEntitiesFamilyState(entity.id))
            .valueMaybe();

          return (
            !currentEntity ||
            JSON.stringify(currentEntity) !==
              JSON.stringify(newEntityMap.get(entity.id))
          );
        });

        // Batch set state for the filtered entities.
        for (const entity of entitiesToUpdate) {
          set(tableEntitiesFamilyState(entity.id), entity);
        }
      },
    [],
  );
