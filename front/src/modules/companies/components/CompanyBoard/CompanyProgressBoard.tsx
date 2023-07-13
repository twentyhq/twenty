import { EntityProgressBoard } from '@/pipeline-progress/components/EntityProgressBoard';
import { useBoard } from '@/pipeline-progress/hooks/useBoard';
import {
  Company,
  Pipeline,
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
  pipeline: Pipeline;
};

export function CompanyProgressBoard({ pipeline }: BoardProps) {
  const { initialBoard, items } = useBoard(useGetCompaniesQuery, pipeline);

  return (
    <EntityProgressBoard
      initialBoard={initialBoard}
      initialItems={items}
      pipeline={pipeline}
      EntityCardComponent={CompanyBoardCard}
      NewEntityButtonComponent={NewCompanyProgressButton}
    />
  );
}
