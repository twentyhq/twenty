import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { useSort } from '@/ui/data/sort/hooks/useSort';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '~/generated/graphql';
import { companiesAvailableFilters } from '~/pages/companies/companies-filters';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

const CompanyTableEffect = () => {
  const { setAvailableSorts } = useSort();
  const {
    setAvailableSorts: viewSetAvailableSorts,
    setAvailableFilters,
    setAvailableFields,
    setViewType,
    setViewObjectId,
  } = useView();

  useEffect(() => {
    setAvailableSorts(companyAvailableSorts);

    viewSetAvailableSorts?.(companyAvailableSorts);
    setAvailableFilters?.(companiesAvailableFilters);
    setAvailableFields?.(companiesAvailableFieldDefinitions);
    setViewObjectId?.('company');
    setViewType?.(ViewType.Table);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setViewObjectId,
    setViewType,
    viewSetAvailableSorts,
  ]);

  return <></>;
};

export default CompanyTableEffect;
