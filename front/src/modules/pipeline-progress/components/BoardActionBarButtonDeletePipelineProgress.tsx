import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { boardState } from '@/pipeline-progress/states/boardState';
import { EntityTableActionBarButton } from '@/ui/components/table/action-bar/EntityTableActionBarButton';
import { IconTrash } from '@/ui/icons/index';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { selectedBoardCardsState } from '../states/selectedBoardCardsState';

export function BoardActionBarButtonDeletePipelineProgress() {
  const [selectedBoardItems, setSelectedBoardItems] = useRecoilState(
    selectedBoardCardsState,
  );
  const [board, setBoard] = useRecoilState(boardState);

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDeleteClick() {
    setBoard(
      board?.map((pipelineStage) => ({
        ...pipelineStage,
        pipelineProgressIds: pipelineStage.pipelineProgressIds.filter(
          (pipelineProgressId) =>
            !selectedBoardItems.includes(pipelineProgressId),
        ),
      })),
    );

    setSelectedBoardItems([]);
    await deletePipelineProgress({
      variables: {
        ids: selectedBoardItems,
      },
    });
  }

  return (
    <EntityTableActionBarButton
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
