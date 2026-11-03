import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { coreAgentIdentityIsSavingFamilyState } from '@/object-core/agents/states/coreAgentIdentityIsSavingFamilyState';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useAtomValue, useStore } from 'jotai';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  PermissionFlagType,
  UpdateOneAgentDocument,
  type UpdateAgentInput,
} from '~/generated-metadata/graphql';

export const useUpdateCoreAgentIdentity = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const pendingAtom = coreAgentIdentityIsSavingFamilyState.getAtom(
    sessionAgentId,
    scopeId,
  );
  const isSavingIdentity = useAtomValue(pendingAtom);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const { enqueueToast } = useToast();

  const updateCoreAgentIdentity = async (
    patch: Pick<UpdateAgentInput, 'label' | 'icon'>,
  ) => {
    const session = store.get(sessionAtom);
    const workspaceCustomApplicationId = store.get(currentWorkspaceState.atom)
      ?.workspaceCustomApplication?.id;
    const canEdit =
      isDefined(session) &&
      !session.agent.isSystem &&
      store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] &&
      getIsMetadataItemCustom(session.agent, workspaceCustomApplicationId);

    if (!canEdit || store.get(pendingAtom)) {
      return false;
    }

    store.set(pendingAtom, true);

    try {
      if (isDefined(patch.label) && !isNonEmptyString(patch.label.trim())) {
        throw new CustomError(t`Agent name cannot be empty.`);
      }

      const { data } = await updateAgent({
        variables: { input: { id: sessionAgentId, ...patch } },
      });
      if (data?.updateOneAgent.id !== sessionAgentId) {
        throw new CustomError(t`The agent could not be updated. Try again.`);
      }
      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
      return false;
    } finally {
      store.set(pendingAtom, false);
    }
  };

  return { updateCoreAgentIdentity, isSavingIdentity };
};
