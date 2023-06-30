import { useCallback, useMemo } from 'react';
import { useTheme } from '@emotion/react';

import { EntityBoardActionBar } from '@/opportunities/components/EntityBoardActionBar';
import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useGetPipelinesQuery,
  useUpdateOnePipelineProgressMutation,
} from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

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

  const onUpdate = useCallback(
    async (
      pipelineProgressId: NonNullable<PipelineProgress['id']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      updatePipelineProgress({
        variables: { id: pipelineProgressId, pipelineStageId },
      });
    },
    [updatePipelineProgress],
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
            onUpdate={onUpdate}
          />
          <EntityBoardActionBar>
            <div>Add action buttons here</div>
          </EntityBoardActionBar>
        </>
      ) : (
        <></>
      )}
    </WithTopBarContainer>
  );
}
