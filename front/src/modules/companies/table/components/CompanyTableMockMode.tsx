import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

export const CompanyTableMockMode = () => {
  return (
    <>
      <CompanyTableMockDataEffect />

      <DataTable updateEntityMutation={useUpdateOneCompanyMutation} />
    </>
  );
};
