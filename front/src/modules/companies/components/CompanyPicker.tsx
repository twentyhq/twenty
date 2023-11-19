import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { getLogoUrlFromDomainName } from '~/utils';

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

  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNamePlural: 'companies',
  });

  const useFindManyCompanies = (options: any) =>
    useQuery(findManyQuery, options);

  const companies = useFilteredSearchEntityQueryV2({
    queryHook: useFindManyCompanies,
    filters: [
      {
        fieldNames: ['name'],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'name',
    mappingFunction: (company) => ({
      entityType: Entity.Company,
      id: company.id,
      name: company.name,
      avatarType: 'squared',
      avatarUrl: getLogoUrlFromDomainName(company.domainName),
      originalEntity: company,
    }),
    selectedIds: companyId ? [companyId] : [],
    objectNamePlural: 'companies',
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
