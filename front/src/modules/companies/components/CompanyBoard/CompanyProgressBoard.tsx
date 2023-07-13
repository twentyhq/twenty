import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { Column } from '@/ui/board/components/Board';
import { Company, PipelineProgress } from '~/generated/graphql';

import { CompanyBoardCard } from './CompanyBoardCard';
import { NewCompanyProgressButton } from './NewCompanyProgressButton';

export type CompanyProgress = {
  entity: Pick<Company, 'id' | 'name' | 'domainName'>;
  pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
};

export type CompanyProgressDict = {
  [key: string]: CompanyProgress;
};

type BoardProps = {
  pipelineId: string;
  initialBoard: Column[];
  initialItems: CompanyProgressDict;
};

export function CompanyProgressBoard({
  initialBoard,
  initialItems,
  pipelineId,
}: BoardProps) {
  return (
    <EntityProgressBoard
      initialBoard={initialBoard}
      initialItems={initialItems}
      pipelineId={pipelineId}
      EntityCardComponent={CompanyBoardCard}
      NewEntityButtonComponent={NewCompanyProgressButton}
    />
  );
}
