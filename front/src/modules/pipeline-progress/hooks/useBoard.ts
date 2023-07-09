import {
  Company,
  PipelineProgress,
  useGetCompaniesQuery,
  useGetPipelinesQuery,
} from '../../../generated/graphql';
import { Column } from '../../ui/board/components/Board';

type ItemCompany = Pick<Company, 'id' | 'name' | 'domainName'>;
type ItemPipelineProgress = Pick<
  PipelineProgress,
  'id' | 'amount' | 'progressableId'
>;

type Item = {
  company: ItemCompany;
  pipelineProgress: ItemPipelineProgress;
};
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
      ...(pipelineStage.pipelineProgresses || []),
    ],
    [] as ItemPipelineProgress[],
  );

  const entitiesQueryResult = useGetCompaniesQuery({
    variables: {
      where: {
        id: { in: pipelineProgresses?.map((item) => item.progressableId) },
      },
    },
  });

  const indexCompanyByIdReducer = (
    acc: { [key: string]: ItemCompany },
    entity: ItemCompany,
  ) => ({
    ...acc,
    [entity.id]: entity,
  });

  const companiesDict = entitiesQueryResult.data?.companies.reduce(
    indexCompanyByIdReducer,
    {} as { [key: string]: ItemCompany },
  );

  const items = pipelineProgresses?.reduce((acc, pipelineProgress) => {
    if (companiesDict?.[pipelineProgress.progressableId]) {
      acc[pipelineProgress.id] = {
        pipelineProgress,
        company: companiesDict[pipelineProgress.progressableId],
      };
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
