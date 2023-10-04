import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useSearchUserQuery } from '~/generated/graphql';

export const useFilteredSearchUserQuery = ({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) =>
  useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: searchFilter,
      },
    ],
    orderByField: 'lastName',
    selectedIds: selectedIds,
    mappingFunction: (user) => ({
      id: user.id,
      entityType: Entity.User,
      name: `${user.displayName}`,
      avatarType: 'rounded',
      avatarUrl: user.avatarUrl ?? '',
      originalEntity: user,
    }),
    limit,
  });
