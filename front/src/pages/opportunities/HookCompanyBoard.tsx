import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useCompanyBoardIndex } from '@/companies/hooks/useCompanyBoardIndex';
import { CompanyProgress } from '@/companies/types/CompanyProgress';
import { BoardPipelineStageColumn } from '@/ui/board/components/Board';
import { Pipeline, useGetPipelinesQuery } from '~/generated/graphql';

import { boardState } from './boardState';
import { companyBoardIndexState } from './companyBoardIndexState';
import { currentPipelineState } from './currentPipelineState';
import { isBoardLoadedState } from './isBoardLoadedState';

export function HookCompanyBoard() {
  const [currentPipeline, setCurrentPipeline] =
    useRecoilState(currentPipelineState);

  const [board, setBoard] = useRecoilState(boardState);

  const [isBoardLoaded, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

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
          pipelineProgressIds:
            pipelineStage.pipelineProgresses?.map(
              (item) => item.id as string,
            ) || [],
        })) || [];
      setBoard(initialBoard);
      setIsBoardLoaded(true);
    },
  });

  const { companyBoardIndex, loading } = useCompanyBoardIndex(currentPipeline);

  const synchronizeCompanyProgresses = useRecoilCallback(
    ({ set }) =>
      (companyBoardIndex: { [key: string]: CompanyProgress }) => {
        // TODO: do the indexing here and not in the hook
        Object.entries(companyBoardIndex).forEach(([id, companyProgress]) => {
          set(companyBoardIndexState(id), companyProgress);
        });
      },
    [],
  );

  useEffect(() => {
    !loading && synchronizeCompanyProgresses(companyBoardIndex);
  }, [loading, companyBoardIndex, synchronizeCompanyProgresses]);

  return <></>;
}
