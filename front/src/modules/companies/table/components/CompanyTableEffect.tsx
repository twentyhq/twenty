import { useEffect } from 'react';

import { useSort } from '@/ui/data/sort/hooks/useSort';
import { useView } from '@/views/hooks/useView';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

const CompanyTableEffect = () => {
  const { setAvailableSorts } = useSort();
  const { setAvailableViewSorts } = useView();
  const { setViewType } = Vuew;

  useEffect(() => {
    setAvailableSorts(companyAvailableSorts);
  }, [setAvailableSorts]);

  return <></>;
};

export default CompanyTableEffect;
