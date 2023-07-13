import { Pipeline } from '~/generated/graphql';
import {
  PipelineStage,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
} from '~/generated/graphql';

import {
  CompanyForBoard,
  CompanyProgress,
  PipelineProgressForBoard,
} from '../types/CompanyProgress';

export function useCompanyBoardIndex(pipeline: Pipeline) {
  const pipelineProgressIds = pipeline.pipelineStages
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
    acc: { [key: string]: CompanyForBoard },
    company: CompanyForBoard,
  ) => ({
    ...acc,
    [company.id]: company,
  });

  const companiesDict =
    entitiesQueryResult.data?.companies.reduce(
      indexCompanyByIdReducer,
      {} as { [key: string]: CompanyForBoard },
    ) || {};

  const indexPipelineProgressByIdReducer = (
    acc: {
      [key: string]: CompanyProgress;
    },
    pipelineProgress: PipelineProgressForBoard,
  ) => {
    const company = companiesDict[pipelineProgress.progressableId];
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
