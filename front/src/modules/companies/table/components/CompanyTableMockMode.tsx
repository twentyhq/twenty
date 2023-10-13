import { DataTable } from '@/ui/Data/Data Table/components/DataTable';
import { TableRecoilScopeContext } from '@/ui/Data/Data Table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/Data/View Bar/contexts/ViewBarContext';
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
