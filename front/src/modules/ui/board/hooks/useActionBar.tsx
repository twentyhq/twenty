import { getOperationName } from '@apollo/client/utilities';
import { useSetRecoilState } from 'recoil';

import { GET_PIPELINES } from '@/pipeline/queries';
import { actionBarEntriesState } from '@/ui/table/states/ActionBarEntriesState';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { BoardActionBarButtonDeleteBoardCard } from '../components/BoardActionBarButtonDeleteBoardCard';

export function useOpenActionBar() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDelete(cardIdsToDelete: string[]) {
    await deletePipelineProgress({
      variables: {
        ids: cardIdsToDelete,
      },
    });
  }

  return () => {
    setActionBarEntries([
      <BoardActionBarButtonDeleteBoardCard onDelete={handleDelete} />,
    ]);
  };
}
