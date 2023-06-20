import { useCallback } from 'react';
import { useTheme } from '@emotion/react';
import { assertNonNullType } from 'graphql';

import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useCreateOnePipelineProgressMutation,
  useUpdateOnePipelineProgressMutation,
} from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

export function Opportunities() {
  const theme = useTheme();

  const {
    initialBoard,
    items,
    loading,
    error,
    pipelineEntityIdsMapper,
    pipelineId,
    pipelineEntityType,
  } = useBoard();
  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();
  const [createPipelineProgress] = useCreateOnePipelineProgressMutation();

  const onUpdate = useCallback(
    async (
      entityId: NonNullable<PipelineProgress['progressableId']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      const pipelineProgressId = pipelineEntityIdsMapper(entityId);
      updatePipelineProgress({
        variables: { id: pipelineProgressId, pipelineStageId },
      });
    },
    [updatePipelineProgress, pipelineEntityIdsMapper],
  );

  const onClickNew = useCallback(
    (
      columnId: PipelineStage['id'],
      newItem: Partial<PipelineProgress> & { id: string },
    ) => {
      if (!pipelineId || !pipelineEntityType) return;
      const variables = {
        pipelineStageId: columnId,
        pipelineId,
        entityId: newItem.id,
        entityType: pipelineEntityType,
      };
      createPipelineProgress({
        variables,
      });
    },
    [pipelineId, pipelineEntityType, createPipelineProgress],
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;
  if (!initialBoard || !items)
    return <div>Initial board or items not found</div>;
  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.iconSizeMedium} />}
    >
      <Board
        initialBoard={initialBoard}
        items={items}
        onUpdate={onUpdate}
        onClickNew={onClickNew}
      />
    </WithTopBarContainer>
  );
}
