import { useCallback } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconTargetArrow } from '@/ui/icons/index';
import { WithTopBarContainer } from '@/ui/layout/containers/WithTopBarContainer';

import {
  PipelineProgress,
  PipelineStage,
  useUpdateOnePipelineProgressMutation,
} from '../../generated/graphql';
import { Board } from '../../modules/opportunities/components/Board';
import { useBoard } from '../../modules/opportunities/hooks/useBoard';

const StyledDiv = styled.div`
  border: 1px solid red;
  border-radius: ${({ theme }) => theme.spacing(2)};
  overflow-x: auto;
`;

export function Opportunities() {
  const theme = useTheme();

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
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.iconSizeMedium} />}
    >
      <StyledDiv>
        <Board initialBoard={initialBoard} items={items} onUpdate={onUpdate} />
      </StyledDiv>
    </WithTopBarContainer>
  );
}
