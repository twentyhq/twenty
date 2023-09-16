import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ActivityTargetableEntityForSelect } from '@/activities/types/ActivityTargetableEntityForSelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useSearchPeopleQuery } from '~/generated/graphql';

export const useFilteredSearchPeopleQuery = ({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) =>
  useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: searchFilter,
      },
    ],
    orderByField: 'lastName',
    selectedIds: selectedIds,
    mappingFunction: (entity) =>
      ({
        id: entity.id,
        entityType: ActivityTargetableEntityType.Person,
        name: `${entity.firstName} ${entity.lastName}`,
        avatarUrl: entity.avatarUrl,
        avatarType: 'rounded',
      } as ActivityTargetableEntityForSelect),
    limit,
  });
