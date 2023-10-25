import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '~/generated/graphql';
import { companyAvailableFilters } from '~/pages/companies/companies-filters';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

const CompanyTableEffect = () => {
  const {
    setAvailableSorts,
    setAvailableFilters,
    setAvailableFields,
    setViewType,
    setViewObjectId,
  } = useView();

  useEffect(() => {
    setAvailableSorts?.(companyAvailableSorts);
    setAvailableFilters?.(companyAvailableFilters);
    setAvailableFields?.(companiesAvailableFieldDefinitions);
    setViewObjectId?.('company');
    setViewType?.(ViewType.Table);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setViewObjectId,
    setViewType,
  ]);

  return <></>;
};

export default CompanyTableEffect;
