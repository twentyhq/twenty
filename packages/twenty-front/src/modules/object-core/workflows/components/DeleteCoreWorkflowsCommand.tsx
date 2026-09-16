import { useMutation } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { DeleteCoreWorkflowsDocument } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DeleteCoreWorkflowsCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const client = useApolloCoreClient();
  const [deleteCoreWorkflows] = useMutation(DeleteCoreWorkflowsDocument, {
    client,
  });
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const execute = async () => {
    const coreWorkflowIds = selectedRecords.map(({ id }) => id);
    if (!isNonEmptyArray(coreWorkflowIds)) {
      return;
    }
    const { data } = await deleteCoreWorkflows({
      variables: { input: { coreWorkflowIds } },
    });
    if (!isNonEmptyArray(data?.deleteCoreWorkflows)) {
      throw new Error('No workflows were deleted');
    }
    for (const { id } of data.deleteCoreWorkflows) {
      client.cache.evict({
        id: client.cache.identify({ __typename: 'CoreWorkflowDTO', id }),
      });
    }
    closeSidePanelMenu();
    navigate(AppPath.WorkflowCoreIndexPage);
    await invalidateCoreWorkflowVersions(client);
  };

  return <HeadlessEngineCommandWrapperEffect execute={execute} />;
};
