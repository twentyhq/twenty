import { useCallback, useMemo } from 'react';
import { useTheme } from '@emotion/react';

import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useGetPipelinesQuery,
  useUpdateOnePipelineProgressMutation,
  useUpdateOnePipelineProgressStageMutation,
} from '../../generated/graphql';
import { Board } from '../../modules/pipeline-progress/components/Board';
import { useBoard } from '../../modules/pipeline-progress/hooks/useBoard';

export function Opportunities() {
  const theme = useTheme();

  const pipelines = useGetPipelinesQuery();
  const pipelineId = pipelines.data?.findManyPipeline[0].id;

  const { initialBoard, items } = useBoard(pipelineId || '');
  const columns = useMemo(
    () =>
      initialBoard?.map(({ id, colorCode, title }) => ({
        id,
        colorCode,
        title,
      })),
    [initialBoard],
  );
  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();
  const [updatePipelineProgressStage] =
    useUpdateOnePipelineProgressStageMutation();

  const handleCardUpdate = useCallback(
    async (
      pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
    ) => {
      updatePipelineProgress({
        variables: {
          id: pipelineProgress.id,
          amount: pipelineProgress.amount,
          closeDate: pipelineProgress.closeDate || null,
        },
      });
    },
    [updatePipelineProgress],
  );

  const handleCardMove = useCallback(
    async (
      pipelineProgressId: NonNullable<PipelineProgress['id']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      updatePipelineProgressStage({
        variables: {
          id: pipelineProgressId,
          pipelineStageId,
        },
      });
    },
    [updatePipelineProgressStage],
  );

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      {items && pipelineId ? (
        <>
          <Board
            pipelineId={pipelineId}
            columns={columns || []}
            initialBoard={initialBoard}
            initialItems={items}
            onCardMove={handleCardMove}
            onCardUpdate={handleCardUpdate}
          />
          <EntityBoardActionBar>
            <BoardActionBarButtonDeletePipelineProgress />
          </EntityBoardActionBar>
        </>
      ) : (
        <></>
      )}
    </WithTopBarContainer>
  );
}
