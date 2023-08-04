import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useInitializeCompanyBoardFilters } from '@/companies/hooks/useInitializeCompanyBoardFilters';
import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import {
  CompanyForBoard,
  CompanyProgress,
  PipelineProgressForBoard,
} from '@/companies/types/CompanyProgress';
import { boardCardIdsByColumnIdFamilyState } from '@/pipeline/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/pipeline/states/boardColumnsState';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { isBoardLoadedState } from '@/pipeline/states/isBoardLoadedState';
import { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  GetPipelineProgressQuery,
  PipelineProgressableType,
  PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By,
} from '~/generated/graphql';
import {
  Pipeline,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
  useGetPipelinesQuery,
} from '~/generated/graphql';

import { CompanyBoardContext } from '../states/CompanyBoardContext';

export function HooksCompanyBoard({
  availableFilters,
  orderBy,
}: {
  availableFilters: FilterDefinition[];
  orderBy: PipelineProgresses_Order_By[];
}) {
  useInitializeCompanyBoardFilters({
    availableFilters,
  });

  const [currentPipeline] = useRecoilState(currentPipelineState);
  const [, setBoardColumns] = useRecoilState(boardColumnsState);

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  const updateBoardColumns = useRecoilCallback(
    ({ set, snapshot }) =>
      (pipeline: Pipeline) => {
        const currentPipeline = snapshot
          .getLoadable(currentPipelineState)
          .valueOrThrow();

        const currentBoardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        if (JSON.stringify(pipeline) !== JSON.stringify(currentPipeline)) {
          set(currentPipelineState, pipeline);
        }

        const pipelineStages = pipeline?.pipelineStages ?? [];

        const orderedPipelineStages = [...pipelineStages].sort((a, b) => {
          if (!a.index || !b.index) return 0;
          return a.index - b.index;
        });

        const newBoardColumns: BoardColumnDefinition[] =
          orderedPipelineStages?.map((pipelineStage) => ({
            id: pipelineStage.id,
            title: pipelineStage.name,
            colorCode: pipelineStage.color,
            index: pipelineStage.index ?? 0,
          }));

        if (
          JSON.stringify(currentBoardColumns) !==
          JSON.stringify(newBoardColumns)
        ) {
          setBoardColumns(newBoardColumns);
        }
      },
    [],
  );

  useGetPipelinesQuery({
    variables: {
      where: {
        pipelineProgressableType: { equals: PipelineProgressableType.Company },
      },
    },
    onCompleted: async (data) => {
      const pipeline = data?.findManyPipeline[0] as Pipeline;

      updateBoardColumns(pipeline);
    },
  });

  const pipelineStageIds = currentPipeline?.pipelineStages
    ?.map((pipelineStage) => pipelineStage.id)
    .flat();

  const filters = useRecoilScopedValue(filtersScopedState, CompanyBoardContext);

  const whereFilters = useMemo(() => {
    return {
      AND: [
        { pipelineStageId: { in: pipelineStageIds } },
        ...filters.map(turnFilterIntoWhereClause),
      ],
    };
  }, [filters, pipelineStageIds]) as any;

  const updateBoardCardIds = useRecoilCallback(
    ({ snapshot, set }) =>
      (
        pipelineProgresses: GetPipelineProgressQuery['findManyPipelineProgress'],
      ) => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        for (const boardColumn of boardColumns) {
          const boardCardIds = pipelineProgresses
            .filter(
              (pipelineProgressToFilter) =>
                pipelineProgressToFilter.pipelineStageId === boardColumn.id,
            )
            .map((pipelineProgress) => pipelineProgress.id);

          set(boardCardIdsByColumnIdFamilyState(boardColumn.id), boardCardIds);
        }
      },
    [],
  );

  const pipelineProgressesQuery = useGetPipelineProgressQuery({
    variables: {
      where: whereFilters,
      orderBy,
    },
    onCompleted: (data) => {
      const pipelineProgresses = data?.findManyPipelineProgress || [];

      updateBoardCardIds(pipelineProgresses);

      setIsBoardLoaded(true);
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

  const synchronizeCompanyProgresses = useRecoilCallback(
    ({ set, snapshot }) =>
      (companyBoardIndex: { [key: string]: CompanyProgress }) => {
        Object.entries(companyBoardIndex).forEach(([id, companyProgress]) => {
          const companyProgressRecoil = snapshot
            .getLoadable(companyProgressesFamilyState(id))
            .valueOrThrow();

          if (
            JSON.stringify(companyProgress) !==
            JSON.stringify(companyProgressRecoil)
          ) {
            set(companyProgressesFamilyState(id), companyProgress);
          }
        });
      },
    [],
  );

  const loading =
    entitiesQueryResult.loading || pipelineProgressesQuery.loading;

  useEffect(() => {
    !loading && synchronizeCompanyProgresses(companyBoardIndex);
  }, [loading, companyBoardIndex, synchronizeCompanyProgresses]);

  return <></>;
}
