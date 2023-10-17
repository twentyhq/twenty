import { suppliersAvailableColumnDefinitions } from '@/companies/constants/companiesAvailableColumnDefinitions';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { DataTable } from '@/ui/data/data-table/components/DataTable';
import { TableContext } from '@/ui/data/data-table/contexts/TableContext';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { ViewBarContext } from '@/ui/data/view-bar/contexts/ViewBarContext';
import { useTableViews } from '@/views/hooks/useTableViews';

import { ObjectDataTableEffect } from './ObjectDataTableEffect';

export const ObjectTable = ({
  objectNamePlural,
  objectNameSingular,
}: {
  objectNameSingular: string;
  objectNamePlural: string;
}) => {
  const { createView, deleteView, submitCurrentView, updateView } =
    useTableViews({
      objectId: 'company',
      columnDefinitions: suppliersAvailableColumnDefinitions,
    });

  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  return (
    <TableContext.Provider
      value={{
        onColumnsChange: () => {
          //
        },
      }}
    >
      <ObjectDataTableEffect
        objectNamePlural={objectNamePlural}
        objectNameSingular={objectNameSingular}
      />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All Suppliers',
          onCurrentViewSubmit: submitCurrentView,
          onViewCreate: createView,
          onViewEdit: updateView,
          onViewRemove: deleteView,
          onImport: openCompanySpreadsheetImport,
          ViewBarRecoilScopeContext: TableRecoilScopeContext,
        }}
      >
        <DataTable
          updateEntityMutation={() => {
            //
          }}
        />
      </ViewBarContext.Provider>
    </TableContext.Provider>
  );
};
