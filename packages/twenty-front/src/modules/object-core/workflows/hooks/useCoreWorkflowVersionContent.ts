import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowVersionDocument } from '~/generated/graphql';

export const useCoreWorkflowVersionContent = ({
  coreWorkflowId,
  coreWorkflowVersionId,
}: {
  coreWorkflowId: string | undefined;
  coreWorkflowVersionId: string | undefined;
}): WorkflowVersion | undefined => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, previousData } = useQuery(GetCoreWorkflowVersionDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-and-network',
    variables: {
      coreWorkflowVersionId: coreWorkflowVersionId ?? '',
    },
    skip: !isDefined(coreWorkflowVersionId) || !isDefined(coreWorkflowId),
  });

  // While the requested version loads, the previous one of the same workflow stays current, so the editor is never left without a version
  const coreWorkflowVersion =
    data?.coreWorkflowVersion ?? previousData?.coreWorkflowVersion;

  if (
    !isDefined(coreWorkflowVersion) ||
    !isDefined(coreWorkflowId) ||
    !isDefined(coreWorkflowVersionId) ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  ) {
    return undefined;
  }

  return buildWorkflowVersionFromCore(coreWorkflowVersion);
};
