import { EntityTable } from '@/ui/table/components/EntityTable';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockData } from './CompanyTableMockData';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyTableMockData />
      <ViewBarContext.Provider value={{ defaultViewName: 'All Companies' }}>
        <EntityTable updateEntityMutation={[useUpdateOneCompanyMutation()]} />
      </ViewBarContext.Provider>
    </>
  );
}
