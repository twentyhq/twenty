import { DataTable } from '@/ui/data-table/components/DataTable';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
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
