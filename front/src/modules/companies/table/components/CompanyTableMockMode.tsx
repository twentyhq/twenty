import { EntityTable } from '@/ui/table/components/EntityTable';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

export function CompanyTableMockMode() {
  return (
    <>
      <CompanyTableMockDataEffect />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All Companies',
          ViewBarRecoilScopeContext: TableRecoilScopeContext,
        }}
      >
        <EntityTable updateEntityMutation={[useUpdateOneCompanyMutation()]} />
      </ViewBarContext.Provider>
    </>
  );
}
