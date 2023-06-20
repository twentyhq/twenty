import { useCallback } from 'react';

import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useUpdateOnePipelineProgressMutation,
} from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

export function Opportunities() {
  const { initialBoard, items, loading, error, pipelineEntityIdsMapper } =
    useBoard();
  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;
  if (!initialBoard || !items)
    return <div>Initial board or items not found</div>;
  return (
    <WithTopBarContainer title="Opportunities" icon={<IconTargetArrow />}>
      <Board initialBoard={initialBoard} items={items} onUpdate={onUpdate} />
    </WithTopBarContainer>
  );
}
