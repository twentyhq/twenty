import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';
import { availableSorts } from '~/pages/companies/companies-sorts';

export function CompanyTableMockMode() {
  return (
    <>
      <EntityTable
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
        useUpdateEntityMutation={useUpdateOneCompanyMutation}
      />
    </>
  );
}
