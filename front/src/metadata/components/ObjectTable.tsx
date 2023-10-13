import { suppliersAvailableColumnDefinitions } from '@/companies/constants/companiesAvailableColumnDefinitions';
import { useCompanyTableActionBarEntries } from '@/companies/hooks/useCompanyTableActionBarEntries';
import { useCompanyTableContextMenuEntries } from '@/companies/hooks/useCompanyTableContextMenuEntries';
import { useSpreadsheetCompanyImport } from '@/companies/hooks/useSpreadsheetCompanyImport';
import { DataTable } from '@/ui/data-table/components/DataTable';
import { TableContext } from '@/ui/data-table/contexts/TableContext';
import { useUpsertDataTableItem } from '@/ui/data-table/hooks/useUpsertDataTableItem';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { filtersWhereScopedSelector } from '@/ui/view-bar/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '@/ui/view-bar/states/selectors/sortsOrderByScopedSelector';
import { useTableViews } from '@/views/hooks/useTableViews';
import {
  UpdateOneCompanyMutationVariables,
  useGetWorkspaceMembersLazyQuery,
  useUpdateOneCompanyMutation,
} from '~/generated/graphql';

import { ObjectDataTableEffect } from './ObjectDataTableEffect';

export const ObjectTable = ({
  objectName,
  objectNameSingular,
}: {
  objectNameSingular: string;
  objectName: string;
}) => {
  const sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const filtersWhere = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  const [updateEntityMutation] = useUpdateOneCompanyMutation();
  const upsertDataTableItem = useUpsertDataTableItem();

  const [getWorkspaceMember] = useGetWorkspaceMembersLazyQuery();
  const {
    createView,
    deleteView,
    persistColumns,
    submitCurrentView,
    updateView,
  } = useTableViews({
    objectId: 'company',
    columnDefinitions: suppliersAvailableColumnDefinitions,
  });

  const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();

  const { setContextMenuEntries } = useCompanyTableContextMenuEntries();
  const { setActionBarEntries } = useCompanyTableActionBarEntries();

  const updateCompany = async (
    variables: UpdateOneCompanyMutationVariables,
  ) => {
    if (variables.data.accountOwner?.connect?.id) {
      const workspaceMemberAccountOwner = (
        await getWorkspaceMember({
          variables: {
            where: {
              userId: { equals: variables.data.accountOwner.connect?.id },
            },
          },
        })
      ).data?.workspaceMembers?.[0];
      variables.data.workspaceMemberAccountOwner = {
        connect: { id: workspaceMemberAccountOwner?.id },
      };
    }

    updateEntityMutation({
      variables: variables,
      onCompleted: (data) => {
        if (!data.updateOneCompany) {
          return;
        }
        upsertDataTableItem(data.updateOneCompany);
      },
    });
  };

  return (
    <TableContext.Provider
      value={{
        onColumnsChange: () => {
          //
        },
      }}
    >
      <ObjectDataTableEffect
        objectName={objectName}
        objectNameSingular={objectNameSingular}
      />
      <ViewBarContext.Provider
        value={{
          defaultViewName: 'All ' + 'Suppliers',
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
