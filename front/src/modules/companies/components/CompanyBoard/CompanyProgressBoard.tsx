import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import {
  Company,
  PipelineProgress,
  useGetCompaniesQuery,
} from '~/generated/graphql';

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
};

export function CompanyProgressBoard({ pipelineId }: BoardProps) {
  const { initialBoard, items } = useBoard(
    pipelineId || '',
    useGetCompaniesQuery,
  );

  return (
    <EntityProgressBoard
      initialBoard={initialBoard}
      initialItems={items}
      pipelineId={pipelineId}
      EntityCardComponent={CompanyBoardCard}
      NewEntityButtonComponent={NewCompanyProgressButton}
    />
  );
}
