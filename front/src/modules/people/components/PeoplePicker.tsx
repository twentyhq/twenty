import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
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
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);

  const [companyProgress] = useRecoilState(
    companyProgressesFamilyState(currentEditableFieldEntityId ?? ''),
  );
  const { company } = companyProgress ?? {};

  const people = useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    selectedIds: [personId ?? ''],
    searchFilter: searchFilter,
    mappingFunction: (person) => ({
      entityType: Entity.Person,
      id: person.id,
      name: `${person.firstName} ${person.lastName}`,
      avatarType: 'rounded',
      avatarUrl: person.avatarUrl ?? '',
      companyId: person.company?.id ?? '',
    }),
    orderByField: 'firstName',
    searchOnFields: ['firstName', 'lastName'],
    excludePersonIds,
  });

  async function handleEntitySelected(
    selectedPerson: PersonForSelect | null | undefined,
  ) {
    onSubmit(selectedPerson ?? null);
  }

  let entitiesToSelect = people.entitiesToSelect;
  if (company)
    entitiesToSelect = people.entitiesToSelect.filter(
      (entity) => entity.companyId === company.id,
    );

  return (
    <SingleEntitySelect
      onEntitySelected={handleEntitySelected}
      onCancel={onCancel}
      onCreate={onCreate}
      entities={{
        loading: people.loading,
        entitiesToSelect: entitiesToSelect,
        selectedEntity: people.selectedEntities[0],
      }}
    />
  );
}
