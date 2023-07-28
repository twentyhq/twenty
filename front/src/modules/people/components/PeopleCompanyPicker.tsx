import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/ui/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { useEditableCell } from '@/ui/table/editable-cell/hooks/useEditableCell';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import {
  Company,
  Person,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

import { EntityForSelect } from '../../ui/relation-picker/types/EntityForSelect';

export type OwnProps = {
  people: Pick<Person, 'id'> & { company?: Pick<Company, 'id'> | null };
};

export function PeopleCompanyPicker({ people }: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updatePerson] = useUpdateOnePersonMutation();

  const { closeEditableCell } = useEditableCell();

  const addToScopeStack = useSetHotkeyScope();

  const companies = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: people.company?.id ? [people.company.id] : [],
  });

  async function handleEntitySelected(
    entity: EntityForSelect | null | undefined,
  ) {
    if (entity) {
      await updatePerson({
        variables: {
          where: {
            id: people.id,
          },
          data: {
            company: { connect: { id: entity.id } },
          },
        },
      });
    }

    closeEditableCell();
  }

  function handleCreate() {
    setIsCreating(true);
    addToScopeStack(TableHotkeyScope.CellDoubleTextInput);
  }

  return (
    <SingleEntitySelect
      onCreate={handleCreate}
      onCancel={() => closeEditableCell()}
      onEntitySelected={handleEntitySelected}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
        loading: companies.loading,
      }}
    />
  );
}
