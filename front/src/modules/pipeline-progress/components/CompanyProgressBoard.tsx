import { Company, PipelineProgress } from '~/generated/graphql';

import { Column } from '../../ui/board/components/Board';

import { EntityProgress, EntityProgressBoard } from './EntityProgressBoard';
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
  EntityCardComponent: React.FC<{
    entity: any;
    pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>;
    selected: boolean;
    onSelect: (entityProgress: EntityProgress) => void;
    onCardUpdate: (
      pipelineProgress: Pick<PipelineProgress, 'id' | 'amount' | 'closeDate'>,
    ) => Promise<void>;
  }>;
  NewEntityButtonComponent: React.FC<{
    pipelineId: string;
    columnId: string;
  }>;
};

export function CompanyProgressBoard({
  columns,
  initialBoard,
  initialItems,
  onCardMove,
  onCardUpdate,
  pipelineId,
  EntityCardComponent,
  NewEntityButtonComponent,
}: BoardProps) {
  return (
    <EntityProgressBoard
      columns={columns}
      initialBoard={initialBoard}
      initialItems={initialItems}
      onCardMove={onCardMove}
      onCardUpdate={onCardUpdate}
      pipelineId={pipelineId}
      EntityCardComponent={EntityCardComponent}
      NewEntityButtonComponent={NewCompanyProgressButton}
    />
  );
}
