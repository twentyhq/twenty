import { useCompanyBoardIndex } from '@/companies/hooks/useCompanyBoardIndex';
import { PipelineProgressForBoard } from '@/companies/types/CompanyProgress';
import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import { Pipeline } from '~/generated/graphql';

import { CompanyBoardCard } from './CompanyBoardCard';
import { NewCompanyProgressButton } from './NewCompanyProgressButton';

type BoardProps = {
  pipeline: Pipeline;
};

export function CompanyProgressBoard({ pipeline }: BoardProps) {
  const { initialBoard } = useBoard(pipeline);
  const { companyBoardIndex, loading } = useCompanyBoardIndex(pipeline);

  function renderCompanyCard(
    pipelineProgressId: string,
    handleSelect: (pipelineProgressId: string) => void,
    handleCardUpdate: (
      pipelineProgress: PipelineProgressForBoard,
    ) => Promise<void>,
    selected: boolean,
  ) {
    return (
      companyBoardIndex[pipelineProgressId] && (
        <CompanyBoardCard
          company={companyBoardIndex[pipelineProgressId].company}
          pipelineProgress={
            companyBoardIndex[pipelineProgressId].pipelineProgress
          }
          selected={selected}
          onCardUpdate={handleCardUpdate}
          onSelect={() => handleSelect(pipelineProgressId)}
        />
      )
    );
  }

  function renderNewCompanyButton(pipelineId: string, columnId: string) {
    return (
      <NewCompanyProgressButton pipelineId={pipelineId} columnId={columnId} />
    );
  }

  return loading ? null : (
    <EntityProgressBoard
      initialBoard={initialBoard}
      pipeline={pipeline}
      renderEntityCard={renderCompanyCard}
      renderNewEntityButton={renderNewCompanyButton}
    />
  );
}
