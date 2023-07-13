import { PipelineProgressableType } from '~/generated/graphql';

import { NewCompanyBoardCard } from './NewCompanyBoardCard';
import { NewEntityProgressButton } from './NewEntityProgressButton';

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
