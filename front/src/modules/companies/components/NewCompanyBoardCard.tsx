import { useCallback } from 'react';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/relation-picker/components/SingleEntitySelect';
import { useFilteredSearchEntityQuery } from '@/relation-picker/hooks/useFilteredSearchEntityQuery';
import { relationPickerSearchFilterScopedState } from '@/relation-picker/states/relationPickerSearchFilterScopedState';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import { CommentableType, useSearchCompanyQuery } from '~/generated/graphql';

export function NewCompanyBoardCard() {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    selectedIds: [],
    searchFilter: searchFilter,
    mappingFunction: (company) => ({
      entityType: CommentableType.Company,
      id: company.id,
      name: company.name,
      domainName: company.domainName,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
    }),
    orderByField: 'name',
    searchOnFields: ['name'],
  });

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
