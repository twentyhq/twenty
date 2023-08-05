import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export type OwnProps = {
  companyId: string | null;
  onSubmit: (newCompany: EntityForSelect | null) => void;
  onCancel?: () => void;
  createModeEnabled?: boolean;
  width?: number;
};

export function CompanyPickerCell({
  companyId,
  onSubmit,
  onCancel,
  createModeEnabled,
  width,
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
      width={width}
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
