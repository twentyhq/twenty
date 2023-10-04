import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { GET_PIPELINES } from '@/pipeline/graphql/queries/getPipelines';
import { useResetTableRowSelection } from '@/ui/data-table/hooks/useResetTableRowSelection';
import { selectedRowIdsSelector } from '@/ui/data-table/states/selectors/selectedRowIdsSelector';
import { tableRowIdsState } from '@/ui/data-table/states/tableRowIdsState';
import { useDeleteManyCompaniesMutation } from '~/generated/graphql';

export const useDeleteSelectedComapnies = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  const resetRowSelection = useResetTableRowSelection();

  const [deleteCompanies] = useDeleteManyCompaniesMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });
  const { performOptimisticEvict } = useOptimisticEvict();

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

          performOptimisticEvict('PipelineProgress', 'companyId', companyId);

          cache.gc();
        });
      },
    });
  };

  return deleteSelectedCompanies;
};
