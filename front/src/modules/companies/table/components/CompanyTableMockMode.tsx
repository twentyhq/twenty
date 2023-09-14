import { EntityTable } from '@/ui/table/components/EntityTable';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockData } from './CompanyTableMockData';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyTableMockData />
      <EntityTable
        defaultViewName="All Companies"
        updateEntityMutation={[useUpdateOneCompanyMutation()]}
      />
    </>
  );
}
