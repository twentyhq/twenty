import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useSearchPeopleQuery } from '~/generated/graphql';

export type OwnProps = {
  personId: string | null;
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
  onSubmit,
  onCancel,
  onCreate,
  excludePersonIds,
}: OwnProps) {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const people = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    selectedIds: [personId ?? ''],
    filters: [
      {
        fieldName: 'firstName',
        filter: relationPickerSearchFilter,
      },
      {
        fieldName: 'lastName',
        filter: relationPickerSearchFilter,
      },
    ],
    mappingFunction: (person) => ({
      entityType: Entity.Person,
      id: person.id,
      name: person.firstName + ' ' + person.lastName,
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
      onEntitySelected={handleEntitySelected}
      onCancel={onCancel}
      onCreate={onCreate}
      entities={{
        loading: people.loading,
        entitiesToSelect: people.entitiesToSelect,
        selectedEntity: people.selectedEntities[0],
      }}
    />
  );
}
