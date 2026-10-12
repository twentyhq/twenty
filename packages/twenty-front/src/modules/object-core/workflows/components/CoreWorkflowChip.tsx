import { useQuery } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CoreWorkflowRunRelationChip } from '@/object-core/workflows/components/CoreWorkflowRunRelationChip';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

type CoreWorkflowChipProps = {
  coreWorkflowId: string;
};

export const CoreWorkflowChip = ({ coreWorkflowId }: CoreWorkflowChipProps) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId },
  });

  if (!isDefined(data?.coreWorkflow)) {
    return null;
  }

  return (
    <CoreWorkflowRunRelationChip
      label={data.coreWorkflow.name}
      colorSeed={coreWorkflowId}
      to={getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })}
    />
  );
};
