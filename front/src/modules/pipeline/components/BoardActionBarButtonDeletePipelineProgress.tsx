import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useDeleteManyPipelineProgressMutation } from '~/generated/graphql';

import { GET_PIPELINES } from '../queries';
import { boardState } from '../states/boardState';
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
