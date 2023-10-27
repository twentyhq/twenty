import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { ViewScope } from '@/views/scopes/ViewScope';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

export const CompanyTableMockMode = () => {
  return (
    <ViewScope viewScopeId="company-table-mock-mode">
      <CompanyTableMockDataEffect />

      <DataTable updateEntityMutation={useUpdateOneCompanyMutation} />
    </ViewScope>
  );
};
