import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useInitializeCompanyBoardFilters } from '@/companies/hooks/useInitializeCompanyBoardFilters';
import { companyProgressesFamilyState } from '@/companies/states/companyProgressesFamilyState';
import {
  CompanyForBoard,
  CompanyProgress,
  PipelineProgressForBoard,
} from '@/companies/types/CompanyProgress';
import { boardState } from '@/pipeline/states/boardState';
import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { isBoardLoadedState } from '@/pipeline/states/isBoardLoadedState';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';
import {
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
  const [currentPipeline, setCurrentPipeline] =
    useRecoilState(currentPipelineState);

  const [board, setBoard] = useRecoilState(boardState);

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  useGetPipelinesQuery({
    variables: {
      where: {
        pipelineProgressableType: { equals: PipelineProgressableType.Company },
      },
    },
    onCompleted: async (data) => {
      const pipeline = data?.findManyPipeline[0] as Pipeline;
      setCurrentPipeline(pipeline);
      const pipelineStages = pipeline?.pipelineStages;
      const orderedPipelineStages = pipelineStages
        ? [...pipelineStages].sort((a, b) => {
            if (!a.index || !b.index) return 0;
            return a.index - b.index;
          })
        : [];
      const initialBoard: BoardPipelineStageColumn[] =
        orderedPipelineStages?.map((pipelineStage, i) => ({
          pipelineStageId: pipelineStage.id,
          title: pipelineStage.name,
          colorCode: pipelineStage.color,
          index: pipelineStage.index || 0,
          pipelineProgressIds: board?.[i].pipelineProgressIds || [],
        })) || [];
      setBoard(initialBoard);
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

  const pipelineProgressesQuery = useGetPipelineProgressQuery({
    variables: {
      where: whereFilters,
      orderBy,
    },
    onCompleted: (data) => {
      const pipelineProgresses = data?.findManyPipelineProgress || [];
      setBoard((board) =>
        board?.map((boardPipelineStage) => ({
          ...boardPipelineStage,
          pipelineProgressIds: pipelineProgresses
            .filter(
              (pipelineProgress) =>
                pipelineProgress.pipelineStageId ===
                boardPipelineStage.pipelineStageId,
            )
            .map((pipelineProgress) => pipelineProgress.id),
        })),
      );
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
    ({ set }) =>
      (companyBoardIndex: { [key: string]: CompanyProgress }) => {
        Object.entries(companyBoardIndex).forEach(([id, companyProgress]) => {
          set(companyProgressesFamilyState(id), companyProgress);
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
