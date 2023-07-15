import { useCallback } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';

import { useFilteredSearchCompanyQuery } from '../services';

export function NewCompanyBoardCard() {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const companies = useFilteredSearchCompanyQuery(searchFilter);

  const handleEntitySelect = useCallback(async (companyId: string) => {
    return;
  }, []);

  function handleCancel() {
    return;
  }

  return (
    <SingleEntitySelect
      onEntitySelected={(value) => handleEntitySelect(value.id)}
      onCancel={handleCancel}
      entities={{
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
        loading: companies.loading,
      }}
    />
  );
}
