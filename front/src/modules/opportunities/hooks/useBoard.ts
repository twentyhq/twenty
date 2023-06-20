import {
  GetCompaniesQuery,
  GetPeopleQuery,
  PipelineProgressableType,
  useGetCompaniesQuery,
  useGetPeopleQuery,
  useGetPipelinesQuery,
} from '../../../generated/graphql';
import { BoardItemKey, Column, Items } from '../../ui/components/board/Board';

type Entities = GetCompaniesQuery | GetPeopleQuery;

function isGetCompaniesQuery(
  entities: Entities,
): entities is GetCompaniesQuery {
  return (entities as GetCompaniesQuery).companies !== undefined;
}

function isGetPeopleQuery(entities: Entities): entities is GetPeopleQuery {
  return (entities as GetPeopleQuery).people !== undefined;
}

export const useBoard = () => {
  const pipelines = useGetPipelinesQuery();
  const pipelineStages = pipelines.data?.findManyPipeline[0].pipelineStages;
  const initialBoard: Column[] =
    pipelineStages?.map((pipelineStage) => ({
      id: pipelineStage.id,
      title: pipelineStage.name,
      colorCode: pipelineStage.color,
      itemKeys:
        pipelineStage.pipelineProgresses?.map(
          (item) => item.progressableId as BoardItemKey,
        ) || [],
    })) || [];

  const pipelineEntityIds = pipelineStages?.reduce(
    (acc, pipelineStage) => [
      ...acc,
      ...(pipelineStage.pipelineProgresses?.map((item) => ({
        entityId: item?.progressableId,
        pipelineProgressId: item?.id,
      })) || []),
    ],
    [] as { entityId: string; pipelineProgressId: string }[],
  );

  const pipelineEntityIdsMapper = (entityId: string) => {
    const pipelineProgressId = pipelineEntityIds?.find(
      (item) => item.entityId === entityId,
    )?.pipelineProgressId;

    return pipelineProgressId;
  };

  const pipelineEntityType =
    pipelines.data?.findManyPipeline[0].pipelineProgressableType;

  const query =
    pipelineEntityType === 'Person' ? useGetPeopleQuery : useGetCompaniesQuery;

  const entitiesQueryResult = query({
    variables: {
      where: { id: { in: pipelineEntityIds?.map((item) => item.entityId) } },
    },
  });

  const indexByIdReducer = (acc: Items, entity: { id: string }) => ({
    ...acc,
    [entity.id]: entity,
  });

  const items: Items | undefined = entitiesQueryResult.data
    ? isGetCompaniesQuery(entitiesQueryResult.data)
      ? entitiesQueryResult.data.companies.reduce(indexByIdReducer, {} as Items)
      : isGetPeopleQuery(entitiesQueryResult.data)
      ? entitiesQueryResult.data.people.reduce(indexByIdReducer, {} as Items)
      : undefined
    : undefined;

  return {
    initialBoard,
    items,
    loading: pipelines.loading || entitiesQueryResult.loading,
    error: pipelines.error || entitiesQueryResult.error,
    pipelineEntityIdsMapper,
    pipelineId: pipelines.data?.findManyPipeline[0].id,
    pipelineEntityType,
  };
};
