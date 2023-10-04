import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/ui/field/states/entityFieldsFamilyState';

export const useUpsertEntityTableItem = () => {
  const apolloClient = useApolloClient();
  return useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string; __typename?: string }>(entity: T) => {
        entity.__typename &&
          apolloClient.cache.evict({
            id: 'ROOT_QUERY',
            fieldName: `findMany${entity.__typename}`,
          });
        const currentEntity = snapshot
          .getLoadable(entityFieldsFamilyState(entity.id))
          .valueOrThrow();

        if (JSON.stringify(currentEntity) !== JSON.stringify(entity)) {
          set(entityFieldsFamilyState(entity.id), entity);
        }
      },
    [apolloClient],
  );
};
