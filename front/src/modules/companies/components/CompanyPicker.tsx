import { useEffect } from 'react';

import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export type OwnProps = {
  companyId: string | null;
  onSubmit: (newCompanyId: EntityForSelect | null) => void;
  onCancel?: () => void;
};

export function CompanyPicker({ companyId, onSubmit, onCancel }: OwnProps) {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  const companies = useFilteredSearchCompanyQuery({
    searchFilter: relationPickerSearchFilter,
    selectedIds: companyId ? [companyId] : [],
  });

  async function handleEntitySelected(
    selectedCompany: EntityForSelect | null | undefined,
  ) {
    onSubmit(selectedCompany ?? null);
  }

  useEffect(() => {
    setRelationPickerSearchFilter('');
  }, [setRelationPickerSearchFilter]);

  return (
    <SingleEntitySelect
      onEntitySelected={handleEntitySelected}
      onCancel={onCancel}
      entities={{
        loading: companies.loading,
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
      }}
    />
  );
}
