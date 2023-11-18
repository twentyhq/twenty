import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
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

  const workspaceMembers = useFilteredSearchEntityQueryV2({
    queryHook: useFindManyWorkspaceMembers,
    filters: [
      {
        fieldNames: ['name.firstName', 'name.lastName'],
        filter: objectFilterDropdownSearchInput,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (workspaceMember) => ({
      entityType: Entity.WorkspaceMember,
      id: workspaceMember.id,
      name:
        workspaceMember.name.firstName + ' ' + workspaceMember.name.lastName,
      avatarType: 'rounded',
      avatarUrl: '',
      originalEntity: workspaceMember,
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
