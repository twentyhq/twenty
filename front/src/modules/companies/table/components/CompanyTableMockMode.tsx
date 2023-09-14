import { EntityTable } from '@/ui/table/components/EntityTable';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyTableMockDataEffect />
      <EntityTable
        defaultViewName="All Companies"
        updateEntityMutation={[useUpdateOneCompanyMutation()]}
      />
    </>
  );
}
