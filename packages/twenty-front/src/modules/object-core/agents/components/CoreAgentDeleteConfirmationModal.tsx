import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { useOpenCoreAgentDeleteDialog } from '@/object-core/agents/hooks/useOpenCoreAgentDeleteDialog';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  DeleteOneAgentDocument,
  FindManyAgentsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type CoreAgentDeleteConfirmationModalProps = { agentId: string };

export const CoreAgentDeleteConfirmationModal = ({
  agentId,
}: CoreAgentDeleteConfirmationModalProps) => {
  const store = useStore();
  const { sessionAtom } = useCoreAgentEditScope(agentId);
  const { dialogId } = useOpenCoreAgentDeleteDialog({ agentId });
  const { closeDialog } = useDialog();
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();
  const [deleteAgent, { loading }] = useMutation(DeleteOneAgentDocument);

  const handleDelete = async () => {
    const session = store.get(sessionAtom);
    const customApplicationId = store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id;
    const canDelete =
      isDefined(session) &&
      !session.isSaving &&
      !session.agent.isSystem &&
      store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] &&
      getIsMetadataItemCustom(session.agent, customApplicationId);
    if (!canDelete || loading) {
      return;
    }
    try {
      const { data } = await deleteAgent({
        variables: { input: { id: agentId } },
        update: (cache, result) => {
          if (result.data?.deleteOneAgent.id !== agentId) {
            return;
          }
          cache.updateQuery({ query: FindManyAgentsDocument }, (cached) =>
            isDefined(cached)
              ? {
                  ...cached,
                  findManyAgents: cached.findManyAgents.filter(
                    ({ id }) => id !== agentId,
                  ),
                }
              : cached,
          );
        },
      });
      if (data?.deleteOneAgent.id !== agentId) {
        throw new CustomError(t`The agent could not be deleted. Try again.`);
      }
      closeDialog(dialogId);
      navigate(AppPath.AgentIndexPage);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <ConfirmationDialog
      dialogId={dialogId}
      title={t`Delete agent?`}
      subtitle={t`This permanently deletes this agent. This action cannot be undone.`}
      onConfirmClick={handleDelete}
      confirmButtonText={t`Delete agent`}
      shouldWaitForConfirmBeforeClosing
      loading={loading}
    />
  );
};
