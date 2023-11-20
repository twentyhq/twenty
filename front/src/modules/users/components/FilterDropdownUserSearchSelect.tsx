import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { ObjectFilterDropdownEntitySearchSelect } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownEntitySearchSelect';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

export const FilterDropdownUserSearchSelect = () => {
  const {
    objectFilterDropdownSearchInput,
    objectFilterDropdownSelectedEntityId,
  } = useFilter();

  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNameSingular: 'workspaceMember',
  });

  const useFindManyWorkspaceMembers = (options: any) =>
    useQuery(findManyQuery, options);

  const workspaceMembers = useFilteredSearchEntityQuery({
    queryHook: useFindManyWorkspaceMembers,
    filters: [
      {
        fieldNames: ['name.firstName', 'name.lastName'],
        filter: objectFilterDropdownSearchInput,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (workspaceMember) => ({
      entityType: 'WorkspaceMember',
      id: workspaceMember.id,
      name:
        workspaceMember.name.firstName + ' ' + workspaceMember.name.lastName,
      avatarType: 'rounded',
      avatarUrl: '',
      record: workspaceMember,
    }),
    selectedIds: objectFilterDropdownSelectedEntityId
      ? [objectFilterDropdownSelectedEntityId]
      : [],
    objectNamePlural: 'workspaceMembers',
  });

  return (
    <ObjectFilterDropdownEntitySearchSelect
      entitiesForSelect={workspaceMembers}
    />
  );
};
