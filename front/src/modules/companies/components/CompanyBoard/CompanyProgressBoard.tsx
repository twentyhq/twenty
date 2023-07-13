import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import { Company, Pipeline, PipelineProgress } from '~/generated/graphql';

import { CompanyBoardCard } from './CompanyBoardCard';
import { NewCompanyProgressButton } from './NewCompanyProgressButton';
import { useCompanyBoardIndex } from './useCompanyBoardIndex';

export type CompanyProgress = {
  company?: Pick<Company, 'id' | 'name' | 'domainName'>;
  pipelineProgress?: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};

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
      pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
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
