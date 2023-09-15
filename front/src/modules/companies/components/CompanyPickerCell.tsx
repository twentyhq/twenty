import { useFilteredSearchCompanyQuery } from '@/companies/hooks/useFilteredSearchCompanyQuery';
import { IconBuildingSkyscraper } from '@/ui/icon';
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
  onSubmit: (newCompany: CompanyPickerSelectedCompany | null) => void;
  onCancel?: () => void;
  createModeEnabled?: boolean;
  width?: number;
};

export type CompanyPickerSelectedCompany = EntityForSelect & {
  domainName: string;
};

export const CompanyPickerCell = ({
  companyId,
  onSubmit,
  onCancel,
  createModeEnabled,
  width,
}: OwnProps) => {
  const [isCreateMode, setIsCreateMode] = useRecoilScopedState(
    isCreateModeScopedState,
  );

  const [insertCompany] = useInsertOneCompanyMutation();

  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const setHotkeyScope = useSetHotkeyScope();

  const companies = useFilteredSearchCompanyQuery({
    searchFilter: relationPickerSearchFilter,
    selectedIds: [companyId ?? ''],
  });

  const handleCompanySelected = async (
    company: CompanyPickerSelectedCompany | null | undefined,
  ) => {
    onSubmit(company ?? null);
  };

  const handleStartCreation = () => {
    setIsCreateMode(true);
    setHotkeyScope(TableHotkeyScope.CellDoubleTextInput);
  };

  const handleCreate = async (firstValue: string, secondValue: string) => {
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
        domainName: companyCreated.domainName,
      });
    setIsCreateMode(false);
  };
  return isCreateMode ? (
    <DoubleTextCellEdit
      firstValue={relationPickerSearchFilter}
      secondValue=""
      firstValuePlaceholder="Name"
      secondValuePlaceholder="Url"
      onSubmit={handleCreate}
    />
  ) : (
    <SingleEntitySelect
      EmptyIcon={IconBuildingSkyscraper}
      emptyLabel="No Company"
      entitiesToSelect={companies.entitiesToSelect}
      loading={companies.loading}
      onCancel={onCancel}
      onCreate={createModeEnabled ? handleStartCreation : undefined}
      onEntitySelected={handleCompanySelected}
      selectedEntity={companies.selectedEntities[0]}
      width={width}
    />
  );
};
