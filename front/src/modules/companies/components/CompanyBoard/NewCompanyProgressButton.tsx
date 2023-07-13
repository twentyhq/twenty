import { NewEntityProgressButton } from '@/pipeline-progress/components/NewEntityProgressButton';
import { PipelineProgressableType } from '~/generated/graphql';

import { NewCompanyBoardCard } from './NewCompanyBoardCard';

type OwnProps = {
  pipelineId: string;
  columnId: string;
};

export function NewCompanyProgressButton({ pipelineId, columnId }: OwnProps) {
  return (
    <NewEntityProgressButton
      pipelineId={pipelineId}
      columnId={columnId}
      NewEntityBoardCardComponent={NewCompanyBoardCard}
      entityType={PipelineProgressableType.Company}
    />
  );
}
