import { Pipeline, PipelineProgress } from '~/generated/graphql';
import {
  Company,
  PipelineStage,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
} from '~/generated/graphql';

import { CompanyProgress } from './CompanyProgressBoard';

export function useCompanyBoardIndex(pipeline: Pipeline | undefined) {
  const pipelineProgressIds = pipeline?.pipelineStages
    ?.map((pipelineStage: PipelineStage) =>
      (
        pipelineStage.pipelineProgresses?.map((item) => item.id as string) || []
      ).flat(),
    )
    .flat();

  const pipelineProgressesQuery = useGetPipelineProgressQuery({
    variables: {
      where: {
        id: { in: pipelineProgressIds },
      },
    },
  });

  const pipelineProgresses =
    pipelineProgressesQuery.data?.findManyPipelineProgress || [];

  const entitiesQueryResult = useGetCompaniesQuery({
    variables: {
      where: {
        id: {
          in: pipelineProgresses.map((item) => item.progressableId),
        },
      },
    },
  });

  const indexCompanyByIdReducer = (
    acc: { [key: string]: Pick<Company, 'id' | 'name' | 'domainName'> },
    company: Pick<Company, 'id' | 'name' | 'domainName'>,
  ) => ({
    ...acc,
    [company.id]: company,
  });
  const companiesDict = entitiesQueryResult.data?.companies.reduce(
    indexCompanyByIdReducer,
    {} as { [key: string]: Company },
  );

  const indexPipelineProgressByIdReducer = (
    acc: {
      [key: string]: CompanyProgress;
    },
    pipelineProgress: Pick<
      PipelineProgress,
      'id' | 'amount' | 'closeDate' | 'progressableId'
    >,
  ) => {
    const company = companiesDict?.[pipelineProgress.progressableId];
    return {
      ...acc,
      [pipelineProgress.id]: {
        pipelineProgress,
        company,
      },
    };
  };
  const companyBoardIndex = pipelineProgresses.reduce(
    indexPipelineProgressByIdReducer,
    {} as { [key: string]: CompanyProgress },
  );

  return {
    companyBoardIndex,
    loading: entitiesQueryResult.loading || pipelineProgressesQuery.loading,
    error: entitiesQueryResult.error || pipelineProgressesQuery.error,
  };
}
