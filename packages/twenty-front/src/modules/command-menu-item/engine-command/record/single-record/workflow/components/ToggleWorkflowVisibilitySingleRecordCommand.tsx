import { useMutation } from '@apollo/client/react';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import {
  UpdateCoreWorkflowVisibilityDocument,
  WorkflowVisibility,
} from '~/generated/graphql';

export const ToggleWorkflowVisibilitySingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const [coreWorkflow] = useCoreWorkflowsWithCurrentVersions(
    isDefined(recordId) ? [recordId] : [],
  );
  const apolloCoreClient = useApolloCoreClient();
  const [updateCoreWorkflowVisibility] = useMutation(
    UpdateCoreWorkflowVisibilityDocument,
    { client: apolloCoreClient },
  );

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to change workflow visibility');
  }

  const handleExecute = () => {
    if (!isDefined(coreWorkflow)) {
      return;
    }

    return updateCoreWorkflowVisibility({
      variables: {
        input: {
          coreWorkflowId: coreWorkflow.id,
          visibility:
            coreWorkflow.visibility === WorkflowVisibility.PRIVATE
              ? WorkflowVisibility.WORKSPACE
              : WorkflowVisibility.PRIVATE,
        },
      },
    });
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(coreWorkflow)}
    />
  );
};
