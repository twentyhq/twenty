import { Pipeline } from '../../../generated/graphql';
import { BoardPipelineStageColumn } from '../../ui/board/components/Board';

export function useBoard(pipeline: Pipeline | undefined) {
  const pipelineStages = pipeline?.pipelineStages;

  const orderedPipelineStages = pipelineStages
    ? [...pipelineStages].sort((a, b) => {
        if (!a.index || !b.index) return 0;
        return a.index - b.index;
      })
    : [];

  const initialBoard: BoardPipelineStageColumn[] =
    orderedPipelineStages?.map((pipelineStage) => ({
      pipelineStageId: pipelineStage.id,
      title: pipelineStage.name,
      colorCode: pipelineStage.color,
      pipelineProgressIds:
        pipelineStage.pipelineProgresses?.map((item) => item.id as string) ||
        [],
    })) || [];

  return {
    initialBoard,
  };
}
