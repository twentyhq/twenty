import { EntityTable } from '@/ui/table/components/EntityTable';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';
import { availableSorts } from '~/pages/companies/companies-sorts';

import { CompanyTableMockData } from './CompanyTableMockData';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyTableMockData />
      <EntityTable
        viewName="All Companies"
        availableSorts={availableSorts}
        updateEntityMutation={[useUpdateOneCompanyMutation()]}
      />
    </>
  );
}
