import { useCallback, useMemo } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

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
import { GET_PIPELINES } from '../../modules/opportunities/queries';

export function Opportunities() {
  const theme = useTheme();

  const { initialBoard, items, error, pipelineId, pipelineEntityType } =
    useBoard();
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
  const [createPipelineProgress] = useCreateOnePipelineProgressMutation();

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
        refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
      });
    },
    [pipelineId, pipelineEntityType, createPipelineProgress],
  );

  if (error) return <div>Error...</div>;
  if (!initialBoard || !items) {
    return <div>Initial board or items not found</div>;
  }

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.iconSizeMedium} />}
    >
      <Board
        columns={columns || []}
        initialBoard={initialBoard}
        items={items}
        onUpdate={onUpdate}
        onClickNew={onClickNew}
      />
    </WithTopBarContainer>
  );
}
