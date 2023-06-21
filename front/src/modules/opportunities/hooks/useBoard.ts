import {
  GetCompaniesQuery,
  GetPeopleQuery,
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
          (item) => item.id as BoardItemKey,
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

  const pipelineProgressableIdsMapper = (pipelineProgressId: string) => {
    const entityId = pipelineEntityIds?.find(
      (item) => item.pipelineProgressId === pipelineProgressId,
    )?.entityId;

    return entityId;
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

  const entityItems = entitiesQueryResult.data
    ? isGetCompaniesQuery(entitiesQueryResult.data)
      ? entitiesQueryResult.data.companies.reduce(indexByIdReducer, {} as Items)
      : isGetPeopleQuery(entitiesQueryResult.data)
      ? entitiesQueryResult.data.people.reduce(indexByIdReducer, {} as Items)
      : undefined
    : undefined;

  const items = pipelineEntityIds?.reduce((acc, item) => {
    const entityId = pipelineProgressableIdsMapper(item.pipelineProgressId);
    if (entityId) {
      acc[item.pipelineProgressId] = entityItems?.[entityId];
    }
    return acc;
  }, {} as Items);

  return {
    initialBoard,
    items,
    loading: pipelines.loading || entitiesQueryResult.loading,
    error: pipelines.error || entitiesQueryResult.error,
    pipelineId: pipelines.data?.findManyPipeline[0].id,
    pipelineEntityType,
  };
};
