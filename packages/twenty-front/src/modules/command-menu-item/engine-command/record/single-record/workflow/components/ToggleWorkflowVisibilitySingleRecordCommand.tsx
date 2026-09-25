import { useMutation } from '@apollo/client/react';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import {
  UpdateCoreWorkflowVisibilityDocument,
  WorkflowVisibility,
} from '~/generated/graphql';

export const ToggleWorkflowVisibilitySingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const apolloCoreClient = useApolloCoreClient();
  const [updateCoreWorkflowVisibility] = useMutation(
    UpdateCoreWorkflowVisibilityDocument,
    { client: apolloCoreClient },
  );

  if (!isDefined(selectedRecord)) {
    throw new Error('Record ID is required to change workflow visibility');
  }

  const handleExecute = () =>
    updateCoreWorkflowVisibility({
      variables: {
        input: {
          coreWorkflowId: selectedRecord.id,
          visibility:
            selectedRecord.visibility === WorkflowVisibility.PRIVATE
              ? WorkflowVisibility.WORKSPACE
              : WorkflowVisibility.PRIVATE,
        },
      },
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
