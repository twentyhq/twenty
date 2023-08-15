import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import { DoubleTextCellEdit } from '@/ui/table/editable-cell/type/components/DoubleTextCellEdit';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useInsertOneCompanyMutation } from '~/generated/graphql';

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
  const [isCreating, setIsCreating] = useRecoilScopedState(
    isCreateModeScopedState,
  );

  const [insertCompany] = useInsertOneCompanyMutation();

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

  function handleStartCreation() {
    setIsCreating(true);
    setHotkeyScope(TableHotkeyScope.CellDoubleTextInput);
  }

  async function handleCreate(firstValue: string, secondValue: string) {
    const insertCompanyRequest = await insertCompany({
      variables: {
        data: {
          name: firstValue,
          domainName: secondValue,
          address: '',
        },
      },
    });
    const companyCreated = insertCompanyRequest.data?.createOneCompany;
    companyCreated &&
      onSubmit({
        id: companyCreated.id,
        name: companyCreated.name,
        entityType: Entity.Company,
      });
    setIsCreating(false);
  }

  return isCreating ? (
    <DoubleTextCellEdit
      firstValue={searchFilter}
      secondValue={''}
      firstValuePlaceholder={'Name'}
      secondValuePlaceholder={'Url'}
      onSubmit={handleCreate}
    />
  ) : (
    <SingleEntitySelect
      width={width}
      onCreate={createModeEnabled ? handleStartCreation : undefined}
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
