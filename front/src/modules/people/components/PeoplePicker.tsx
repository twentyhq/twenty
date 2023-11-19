import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export type PeoplePickerProps = {
  personId: string | null;
  companyId?: string;
  onSubmit: (newPersonId: PersonForSelect | null) => void;
  onCancel?: () => void;
  onCreate?: () => void;
  excludePersonIds?: string[];
  initialSearchFilter?: string | null;
};

export type PersonForSelect = EntityForSelect & {
  entityType: Entity.Person;
};

export const PeoplePicker = ({
  personId,
  companyId,
  onSubmit,
  onCancel,
  onCreate,
  excludePersonIds,
  initialSearchFilter,
}: PeoplePickerProps) => {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const queryFilters = [
    {
      fieldNames: ['name.firstName', 'name.lastName'],
      filter: relationPickerSearchFilter,
    },
  ];

  if (companyId) {
    queryFilters.push({
      fieldNames: ['companyId'],
      filter: companyId,
    });
  }

  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNameSingular: 'person',
  });

  const useFindManyPeople = (options: any) => useQuery(findManyQuery, options);

  const people = useFilteredSearchEntityQueryV2({
    queryHook: useFindManyPeople,
    filters: queryFilters,
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
    selectedIds: [personId ?? ''],
    excludeEntityIds: excludePersonIds,
    objectNamePlural: 'people',
  });

  const handleEntitySelected = async (
    selectedPerson: any | null | undefined,
  ) => {
    onSubmit(selectedPerson ?? null);
  };

  return (
    <SingleEntitySelect
      entitiesToSelect={people.entitiesToSelect}
      loading={people.loading}
      onCancel={onCancel}
      onCreate={onCreate}
      onEntitySelected={handleEntitySelected}
      selectedEntity={people.selectedEntities[0]}
    />
  );
};
