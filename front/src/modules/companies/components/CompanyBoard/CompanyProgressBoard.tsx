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
  columns: Omit<Column, 'itemKeys'>[];
  initialBoard: Column[];
  initialItems: CompanyProgressDict;
  onCardMove?: (itemKey: string, columnId: Column['id']) => Promise<void>;
  onCardUpdate: (
    pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
  ) => Promise<void>;
};

export function CompanyProgressBoard({
  columns,
  initialBoard,
  initialItems,
  onCardMove,
  onCardUpdate,
  pipelineId,
}: BoardProps) {
  return (
    <EntityProgressBoard
      columns={columns}
      initialBoard={initialBoard}
      initialItems={initialItems}
      onCardMove={onCardMove}
      onCardUpdate={onCardUpdate}
      pipelineId={pipelineId}
      EntityCardComponent={CompanyBoardCard}
      NewEntityButtonComponent={NewCompanyProgressButton}
    />
  );
}
