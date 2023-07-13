import { Pipeline } from '../../../generated/graphql';
import { Column } from '../../ui/board/components/Board';

export function useBoard(pipeline: Pipeline | undefined) {
  const pipelineStages = pipeline?.pipelineStages;

  const orderedPipelineStages = pipelineStages
    ? [...pipelineStages].sort((a, b) => {
        if (!a.index || !b.index) return 0;
        return a.index - b.index;
      })
    : [];

  const initialBoard: Column[] =
    orderedPipelineStages?.map((pipelineStage) => ({
      id: pipelineStage.id,
      title: pipelineStage.name,
      colorCode: pipelineStage.color,
      itemKeys:
        pipelineStage.pipelineProgresses?.map((item) => item.id as string) ||
        [],
    })) || [];

  return {
    initialBoard,
  };
}
