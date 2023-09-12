import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useSearchPeopleQuery } from '~/generated/graphql';

export type OwnProps = {
  personId: string | null;
  companyId?: string;
  onSubmit: (newPersonId: PersonForSelect | null) => void;
  onCancel?: () => void;
  onCreate?: () => void;
  excludePersonIds?: string[];
};

export type PersonForSelect = EntityForSelect & {
  entityType: Entity.Person;
};

export function PeoplePicker({
  personId,
  companyId,
  onSubmit,
  onCancel,
  onCreate,
  excludePersonIds,
}: OwnProps) {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const queryFilters = [
    {
      fieldNames: ['firstName', 'lastName'],
      filter: relationPickerSearchFilter,
    },
  ];

  if (companyId) {
    queryFilters.push({
      fieldNames: ['companyId'],
      filter: companyId,
    });
  }

  const people = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    selectedIds: [personId ?? ''],
    filters: queryFilters,
    mappingFunction: (person) => ({
      entityType: Entity.Person,
      id: person.id,
      name: `${person.firstName} ${person.lastName}`,
      avatarType: 'rounded',
      avatarUrl: person.avatarUrl ?? '',
    }),
    orderByField: 'firstName',
    excludeEntityIds: excludePersonIds,
  });

  async function handleEntitySelected(
    selectedPerson: PersonForSelect | null | undefined,
  ) {
    onSubmit(selectedPerson ?? null);
  }

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
}
