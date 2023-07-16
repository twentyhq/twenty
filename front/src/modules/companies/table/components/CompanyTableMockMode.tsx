import { companyColumns } from '@/companies/table/components/companyColumns';
import { CompanyEntityTableDataMocked } from '@/companies/table/components/CompanyEntityTableDataMocked';
import { IconList } from '@/ui/icon';
import { EntityTable } from '@/ui/table/components/EntityTable';
import { HooksEntityTable } from '@/ui/table/components/HooksEntityTable';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { availableSorts } from '~/pages/companies/companies-sorts';

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
