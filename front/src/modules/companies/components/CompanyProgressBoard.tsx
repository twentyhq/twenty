import { useRecoilState, useRecoilValue } from 'recoil';

import { useCompanyBoardIndex } from '@/companies/hooks/useCompanyBoardIndex';
import { PipelineProgressForBoard } from '@/companies/types/CompanyProgress';
import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import { Pipeline } from '~/generated/graphql';
import { currentPipelineState } from '~/pages/opportunities/currentPipelineState';

import { CompanyBoardCard } from './CompanyBoardCard';
import { NewCompanyProgressButton } from './NewCompanyProgressButton';

export function CompanyProgressBoard() {
  const [currentPipeline] = useRecoilState(currentPipelineState);
  const { initialBoard } = useBoard(currentPipeline);

  // function renderCompanyCard(
  //   pipelineProgressId: string,
  //   handleSelect: (pipelineProgressId: string) => void,
  //   handleCardUpdate: (
  //     pipelineProgress: PipelineProgressForBoard,
  //   ) => Promise<void>,
  //   selected: boolean,
  // ) {
  //   return (
  //     companyBoardIndex[pipelineProgressId] && (
  //       <CompanyBoardCard
  //         company={companyBoardIndex[pipelineProgressId].company}
  //         pipelineProgress={
  //           companyBoardIndex[pipelineProgressId].pipelineProgress
  //         }
  //         selected={selected}
  //         onCardUpdate={handleCardUpdate}
  //         onSelect={() => handleSelect(pipelineProgressId)}
  //       />
  //     )
  //   );
  // }

  // function renderNewCompanyButton(pipelineId: string, columnId: string) {
  //   return (
  //     <NewCompanyProgressButton pipelineId={pipelineId} columnId={columnId} />
  //   );
  // }

  return <EntityProgressBoard />;
}
