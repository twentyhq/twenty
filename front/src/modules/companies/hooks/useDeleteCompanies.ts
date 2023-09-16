import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';

import { GET_PIPELINES } from '@/pipeline/graphql/queries/getPipelines';
import { useResetTableRowSelection } from '@/ui/table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { useDeleteManyCompaniesMutation } from '~/generated/graphql';

export const useDeleteSelectedComapnies = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteCompanies] = useDeleteManyCompaniesMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  const [tableRowIds, setTableRowIds] = useRecoilState(tableRowIdsState);

  const deleteSelectedCompanies = async () => {
    const rowIdsToDelete = selectedRowIds;

    resetRowSelection();

    await deleteCompanies({
      variables: {
        ids: rowIdsToDelete,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        deleteManyCompany: {
          count: rowIdsToDelete.length,
        },
      },
      update: (cache) => {
        setTableRowIds(
          tableRowIds.filter((id) => !rowIdsToDelete.includes(id)),
        );

        rowIdsToDelete.forEach((companyId) => {
          cache.evict({
            id: cache.identify({ __typename: 'Company', id: companyId }),
          });
          cache.gc();
        });
      },
    });
  };

  return deleteSelectedCompanies;
};
