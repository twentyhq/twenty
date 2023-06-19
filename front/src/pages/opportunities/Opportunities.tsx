import { useCallback } from 'react';

import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import { PipelineProgress, PipelineStage } from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

export function Opportunities() {
  const { initialBoard, items, loading, error } = useBoard();

  const onUpdate = useCallback(
    (
      pipelineEntityId: NonNullable<PipelineProgress['progressableId']>,
      pipelineStageId: NonNullable<PipelineStage['id']>,
    ) => {
      console.log(pipelineEntityId, pipelineStageId);
      throw new Error('Not implemented');
    },
    [],
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
