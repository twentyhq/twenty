import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/data/view-bar/contexts/ViewBarContext';
import { useUpdateOneCompanyMutation } from '~/generated/graphql';

import { CompanyTableMockDataEffect } from './CompanyTableMockDataEffect';

export const CompanyTableMockMode = () => {
  return (
    <>
      <CompanyTableMockDataEffect />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All Companies',
          ViewBarRecoilScopeContext: TableRecoilScopeContext,
        }}
      >
        <DataTable updateEntityMutation={useUpdateOneCompanyMutation} />
      </ViewBarContext.Provider>
    </>
  );
};
