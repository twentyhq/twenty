import { useEffect } from 'react';

import { useSort } from '@/ui/data/sort/hooks/useSort';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

const CompanyTableEffect = () => {
  const { setAvailableSorts } = useSort();

  useEffect(() => {
    setAvailableSorts(companyAvailableSorts);
  }, [setAvailableSorts]);

  return <></>;
};

export default CompanyTableEffect;
