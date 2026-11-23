import { useMutation } from '@apollo/client/react';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { UpdateCoreWorkflowDocument } from '~/generated/graphql';

export const ToggleWorkflowVisibilitySingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const selectedRecord = selectedRecords[0];
  const apolloCoreClient = useApolloCoreClient();
  const [updateCoreWorkflow] = useMutation(UpdateCoreWorkflowDocument, {
    client: apolloCoreClient,
  });

  if (!isDefined(selectedRecord)) {
    throw new Error(
      doNotTranslate('Record ID is required to change workflow visibility'),
    );
  }

  const handleExecute = () =>
    updateCoreWorkflow({
      variables: {
        input: {
          coreWorkflowId: selectedRecord.id,
          isPrivate: !selectedRecord.isPrivate,
        },
      },
    });

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
