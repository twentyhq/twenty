import { useCallback, useMemo } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

import { BoardActionBarButtonDeletePipelineProgress } from '@/pipeline-progress/components/BoardActionBarButtonDeletePipelineProgress';
import { CompanyBoardCard } from '@/pipeline-progress/components/CompanyBoardCard';
import { EntityBoardActionBar } from '@/pipeline-progress/components/EntityBoardActionBar';
import { NewCompanyProgressButton } from '@/pipeline-progress/components/NewCompanyProgressButton';
import { GET_PIPELINES } from '@/pipeline-progress/queries';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useGetPipelinesQuery,
  useUpdateOnePipelineProgressMutation,
  useUpdateOnePipelineProgressStageMutation,
} from '../../generated/graphql';
import { CompanyProgressBoard } from '../../modules/pipeline-progress/components/CompanyProgressBoard';
import { useBoard } from '../../modules/pipeline-progress/hooks/useBoard';

export function Opportunities() {
  const theme = useTheme();

  const pipelines = useGetPipelinesQuery();
  const pipelineId = pipelines.data?.findManyPipeline[0]?.id;

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
      await updatePipelineProgress({
        variables: {
          id: pipelineProgress.id,
          amount: pipelineProgress.amount,
          closeDate: pipelineProgress.closeDate || null,
        },
        refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
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
          <CompanyProgressBoard
            pipelineId={pipelineId}
            columns={columns || []}
            initialBoard={initialBoard}
            initialItems={items}
            onCardMove={handleCardMove}
            onCardUpdate={handleCardUpdate}
            EntityCardComponent={CompanyBoardCard}
            NewEntityButtonComponent={NewCompanyProgressButton}
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
