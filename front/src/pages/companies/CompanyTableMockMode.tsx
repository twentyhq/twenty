import { IconList } from '@tabler/icons-react';

import { companyColumns } from '@/companies/table/components/companyColumns';
import { CompanyEntityTableDataMocked } from '@/companies/table/components/CompanyEntityTableDataMocked';
import { EntityTable } from '@/ui/components/table/EntityTable';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';

import { companiesFilters } from './companies-filters';
import { availableSorts } from './companies-sorts';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyEntityTableDataMocked />
      <HooksEntityTable
        numberOfColumns={companyColumns.length}
        availableFilters={companiesFilters}
      />
      <EntityTable
        columns={companyColumns}
        viewName="All Companies"
        viewIcon={<IconList size={16} />}
        availableSorts={availableSorts}
      />
    </>
  );
}
