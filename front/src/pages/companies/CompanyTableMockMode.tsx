import { IconList } from '@tabler/icons-react';

import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { useCompaniesColumns } from './companies-columns';
import { companiesFilters } from './companies-filters';
import { availableSorts } from './companies-sorts';

export function CompanyTableMockMode() {
  const companiesColumns = useCompaniesColumns();

  const companies = mockedCompaniesData;

  return (
    <>
      <HooksEntityTable
        numberOfColumns={companiesColumns.length}
        numberOfRows={companies.length}
        availableTableFilters={companiesFilters}
      />
      <EntityTable
        data={companies}
        columns={companiesColumns}
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
      />
    </>
  );
}
