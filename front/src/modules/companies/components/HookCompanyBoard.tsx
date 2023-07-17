import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

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
import {
  Pipeline,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
  useGetPipelinesQuery,
} from '~/generated/graphql';

export function HookCompanyBoard() {
  const [currentPipeline, setCurrentPipeline] =
    useRecoilState(currentPipelineState);

  const [, setBoard] = useRecoilState(boardState);

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  useGetPipelinesQuery({
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
        orderedPipelineStages?.map((pipelineStage) => ({
          pipelineStageId: pipelineStage.id,
          title: pipelineStage.name,
          colorCode: pipelineStage.color,
          index: pipelineStage.index || 0,
          pipelineProgressIds: [],
        })) || [];
      setBoard(initialBoard);
    },
  });

  const pipelineStageIds = currentPipeline?.pipelineStages
    ?.map((pipelineStage) => pipelineStage.id)
    .flat();

  const pipelineProgressesQuery = useGetPipelineProgressQuery({
    variables: {
      where: {
        pipelineStageId: { in: pipelineStageIds },
      },
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
