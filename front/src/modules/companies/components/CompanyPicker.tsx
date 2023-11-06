import { useEffect } from 'react';

import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { useFilteredSearchCompanyQuery } from '../hooks/useFilteredSearchCompanyQuery';

export type CompanyPickerProps = {
  companyId: string | null;
  onSubmit: (newCompanyId: EntityForSelect | null) => void;
  onCancel?: () => void;
  initialSearchFilter?: string | null;
};

export const CompanyPicker = ({
  companyId,
  onSubmit,
  onCancel,
  initialSearchFilter,
}: CompanyPickerProps) => {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  useEffect(() => {
    if (initialSearchFilter) {
      setRelationPickerSearchFilter(initialSearchFilter);
    }
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const companies = useFilteredSearchCompanyQuery({
    searchFilter: relationPickerSearchFilter,
    selectedIds: companyId ? [companyId] : [],
  });

  const handleEntitySelected = async (
    selectedCompany: EntityForSelect | null | undefined,
  ) => {
    onSubmit(selectedCompany ?? null);
  };

  return (
    <SingleEntitySelect
      entitiesToSelect={companies.entitiesToSelect}
      loading={companies.loading}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      selectedEntity={companies.selectedEntities[0]}
    />
  );
};
