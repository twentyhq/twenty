import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentCreationPendingFamilyState } from '@/object-core/agents/states/coreAgentCreationPendingFamilyState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useAtomValue, useStore } from 'jotai';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';
import { CreateOneAgentDocument } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

export const useCreateCoreAgent = ({
  navigateOnCreate = true,
}: { navigateOnCreate?: boolean } = {}) => {
  const store = useStore();
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const user = useAtomValue(currentUserState.atom);
  const canCreateCoreAgent = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const pendingAtom = coreAgentCreationPendingFamilyState.getAtom(
    `${workspace?.id}:${user?.id}`,
    null,
  );
  const isCreatingCoreAgent = useAtomValue(pendingAtom);
  const [createOneAgentMutation] = useMutation(CreateOneAgentDocument);
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();
  const isCurrentActor = () =>
    store.get(currentWorkspaceState.atom)?.id === workspace?.id &&
    store.get(currentUserState.atom)?.id === user?.id;

  const createCoreAgent = async () => {
    const canCreate = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];
    if (
      !canCreate ||
      !isDefined(workspace) ||
      !isDefined(user) ||
      !isCurrentActor() ||
      store.get(pendingAtom)
    ) {
      return;
    }
    store.set(pendingAtom, true);
    try {
      const { data } = await createOneAgentMutation({
        variables: {
          input: {
            name: `untitledAgent${v4().split('-')[0]}`,
            label: t`Untitled agent`,
            icon: 'IconLego',
            prompt: doNotTranslate('You are a helpful AI assistant.'),
            modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
          },
        },
      });
      if (!isCurrentActor()) {
        return;
      }
      const agentId = data?.createOneAgent.id;
      if (!isDefined(agentId)) {
        enqueueToast({ status: 'error', children: t`Failed to create agent` });
        return;
      }
      if (navigateOnCreate) {
        navigate(AppPath.AgentShowPage, { agentId });
      }
      return agentId;
    } catch (error) {
      logError(error);
      if (isCurrentActor()) {
        enqueueToast({ status: 'error', children: t`Failed to create agent` });
      }
    } finally {
      store.set(pendingAtom, false);
    }
  };
  return { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent };
};
