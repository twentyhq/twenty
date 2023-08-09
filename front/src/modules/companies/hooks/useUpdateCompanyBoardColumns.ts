import { useRecoilCallback } from 'recoil';

import { currentPipelineState } from '@/pipeline/states/currentPipelineState';
import { boardCardIdsByColumnIdFamilyState } from '@/ui/board/states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '@/ui/board/states/boardColumnsState';
import { BoardColumnDefinition } from '@/ui/board/types/BoardColumnDefinition';
import { genericEntitiesFamilyState } from '@/ui/editable-field/states/genericEntitiesFamilyState';
import { Pipeline } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { companyProgressesFamilyState } from '../states/companyProgressesFamilyState';
import {
  CompanyForBoard,
  CompanyProgressDict,
  PipelineProgressForBoard,
} from '../types/CompanyProgress';

export function useUpdateCompanyBoard() {
  return useRecoilCallback(
    ({ set, snapshot }) =>
      (
        pipeline: Pipeline,
        pipelineProgresses: (PipelineProgressForBoard & {
          pipelineStageId: string;
        })[],
        companies: CompanyForBoard[],
      ) => {
        const indexCompanyByIdReducer = (
          acc: { [key: string]: CompanyForBoard },
          company: CompanyForBoard,
        ) => ({
          ...acc,
          [company.id]: company,
        });

        const companiesDict =
          companies.reduce(
            indexCompanyByIdReducer,
            {} as { [key: string]: CompanyForBoard },
          ) ?? {};

        const indexPipelineProgressByIdReducer = (
          acc: CompanyProgressDict,
          pipelineProgress: PipelineProgressForBoard,
        ) => {
          const company =
            pipelineProgress.companyId &&
            companiesDict[pipelineProgress.companyId];

          if (!company) return acc;

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
          {} as CompanyProgressDict,
        );

        for (const [id, companyProgress] of Object.entries(companyBoardIndex)) {
          const currentCompanyProgress = snapshot
            .getLoadable(companyProgressesFamilyState(id))
            .valueOrThrow();

          if (!isDeeplyEqual(currentCompanyProgress, companyProgress)) {
            set(companyProgressesFamilyState(id), companyProgress);
            set(
              genericEntitiesFamilyState(id),
              companyProgress.pipelineProgress,
            );
          }
        }

        const currentPipeline = snapshot
          .getLoadable(currentPipelineState)
          .valueOrThrow();

        const currentBoardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        if (!isDeeplyEqual(pipeline, currentPipeline)) {
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

        if (!isDeeplyEqual(currentBoardColumns, newBoardColumns)) {
          set(boardColumnsState, newBoardColumns);
        }

        for (const boardColumn of newBoardColumns) {
          const boardCardIds = pipelineProgresses
            .filter(
              (pipelineProgressToFilter) =>
                pipelineProgressToFilter.pipelineStageId === boardColumn.id,
            )
            .map((pipelineProgress) => pipelineProgress.id);

          const currentBoardCardIds = snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(boardColumn.id))
            .valueOrThrow();

          if (!isDeeplyEqual(currentBoardCardIds, boardCardIds)) {
            set(
              boardCardIdsByColumnIdFamilyState(boardColumn.id),
              boardCardIds,
            );
          }
        }
      },
    [],
  );
}
