import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/ui/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';

import { EntityForSelect } from '../../ui/relation-picker/types/EntityForSelect';

export type OwnProps = {
  companyId: string | null;
  onSubmit: (newCompany: EntityForSelect | null) => void;
  onCancel?: () => void;
  createModeEnabled?: boolean;
};

export function CompanyPickerCell({
  companyId,
  onSubmit,
  onCancel,
  createModeEnabled,
}: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const companies = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: [companyId ?? ''],
  });

  async function handleEntitySelected(
    entity: EntityForSelect | null | undefined,
  ) {
    onSubmit(entity ?? null);
  }

  function handleCreate() {
    setIsCreating(true);
    setHotkeyScope(TableHotkeyScope.CellDoubleTextInput);
  }

  return (
    <SingleEntitySelect
      onCreate={createModeEnabled ? handleCreate : undefined}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
        loading: companies.loading,
      }}
    />
  );
}
