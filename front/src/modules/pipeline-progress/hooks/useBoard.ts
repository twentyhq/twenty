import {
  Pipeline,
  PipelineProgress,
  useGetPipelineProgressQuery,
} from '../../../generated/graphql';
import { Column } from '../../ui/board/components/Board';

type ItemEntity = any;
type ItemPipelineProgress = Pick<
  PipelineProgress,
  'id' | 'amount' | 'progressableId'
>;

type Item = {
  entity: ItemEntity;
  pipelineProgress: ItemPipelineProgress;
};
type Items = { [key: string]: Item };

export function useBoard(
  useGetEntitiesQuery: any,
  pipeline: Pipeline | undefined,
) {
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

  const pipelineProgressIds = initialBoard.map((item) => item.itemKeys).flat();

  const pipelineProgressesQuery = useGetPipelineProgressQuery({
    variables: {
      where: {
        id: { in: pipelineProgressIds },
      },
    },
  });

  const pipelineProgresses =
    pipelineProgressesQuery.data?.findManyPipelineProgress || [];

  const entitiesQueryResult = useGetEntitiesQuery({
    variables: {
      where: {
        id: {
          in: pipelineProgresses.map((item) => item.progressableId),
        },
      },
    },
  });

  const indexEntityByIdReducer = (
    acc: { [key: string]: ItemEntity },
    entity: ItemEntity,
  ) => ({
    ...acc,
    [entity.id]: entity,
  });

  const entitiesDict = entitiesQueryResult.data?.companies.reduce(
    indexEntityByIdReducer,
    {} as { [key: string]: ItemEntity },
  );

  const items = pipelineProgresses?.reduce((acc, pipelineProgress) => {
    if (entitiesDict?.[pipelineProgress.progressableId]) {
      acc[pipelineProgress.id] = {
        pipelineProgress,
        entity: entitiesDict[pipelineProgress.progressableId],
      };
    }
    return acc;
  }, {} as Items);

  return {
    initialBoard,
    items: items,
    loading: entitiesQueryResult.loading || pipelineProgressesQuery.loading,
    error: entitiesQueryResult.error || pipelineProgressesQuery.error,
  };
}
