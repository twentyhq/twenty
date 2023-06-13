import {
  useGetPeopleQuery,
  useGetPipelinesQuery,
} from '../../../generated/graphql';
import { BoardItemKey, Column, Items } from '../../ui/components/board/Board';

export const useBoard = () => {
  const pipelines = useGetPipelinesQuery();
  const pipelineStages = pipelines.data?.findManyPipeline[0].pipelineStages;
  const initialBoard: Column[] =
    pipelineStages?.map((pipelineStage) => ({
      id: pipelineStage.name,
      title: pipelineStage.name,
      colorCode: pipelineStage.color,
      itemKeys:
        pipelineStage.pipelineProgresses?.map(
          (item) => `item-${item.associableId}` as BoardItemKey,
        ) || [],
    })) || [];

  const pipelineEntityIds = pipelineStages?.reduce(
    (acc, pipelineStage) => [
      ...acc,
      ...(pipelineStage.pipelineProgresses?.map((item) => item.associableId) ||
        []),
    ],
    [] as string[],
  );

  const entities = useGetPeopleQuery({
    variables: { where: { id: { in: pipelineEntityIds } } },
  });

  const items: Items =
    entities.data?.people.reduce(
      (acc, person) => ({ ...acc, [`item-${person.id}`]: person }),
      {},
    ) || {};

  return {
    initialBoard,
    items,
    loading: pipelines.loading || entities.loading,
    error: pipelines.error || entities.error,
  };
};
