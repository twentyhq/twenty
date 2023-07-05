import {
  Company,
  useGetCompaniesQuery,
  useGetPipelinesQuery,
} from '../../../generated/graphql';
import { Column } from '../../ui/components/board/Board';

type Item = Pick<Company, 'id' | 'name' | 'createdAt' | 'domainName'>;
type Items = { [key: string]: Item };

export function useBoard(pipelineId: string) {
  const pipelines = useGetPipelinesQuery({
    variables: { where: { id: { equals: pipelineId } } },
  });
  const pipelineStages = pipelines.data?.findManyPipeline[0]?.pipelineStages;

  const initialBoard: Column[] =
    pipelineStages?.map((pipelineStage) => ({
      id: pipelineStage.id,
      title: pipelineStage.name,
      colorCode: pipelineStage.color,
      itemKeys:
        pipelineStage.pipelineProgresses?.map((item) => item.id as string) ||
        [],
    })) || [];

  const pipelineProgresses = pipelineStages?.reduce(
    (acc, pipelineStage) => [
      ...acc,
      ...(pipelineStage.pipelineProgresses?.map((item) => ({
        progressableId: item?.progressableId,
        pipelineProgressId: item?.id,
      })) || []),
    ],
    [] as { progressableId: string; pipelineProgressId: string }[],
  );

  const entitiesQueryResult = useGetCompaniesQuery({
    variables: {
      where: {
        id: { in: pipelineProgresses?.map((item) => item.progressableId) },
      },
    },
  });

  const indexByIdReducer = (acc: Items, entity: Item) => ({
    ...acc,
    [entity.id]: entity,
  });

  const companiesDict = entitiesQueryResult.data?.companies.reduce(
    indexByIdReducer,
    {} as Items,
  );

  const items = pipelineProgresses?.reduce((acc, pipelineProgress) => {
    if (companiesDict?.[pipelineProgress.progressableId]) {
      acc[pipelineProgress.pipelineProgressId] =
        companiesDict[pipelineProgress.progressableId];
    }
    return acc;
  }, {} as Items);

  return {
    initialBoard,
    items,
    loading: pipelines.loading || entitiesQueryResult.loading,
    error: pipelines.error || entitiesQueryResult.error,
  };
}
