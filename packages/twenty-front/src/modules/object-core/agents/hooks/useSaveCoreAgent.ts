import { useApolloClient, useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { coreAgentDiscardCountFamilyState } from '@/object-core/agents/states/coreAgentDiscardCountFamilyState';
import { coreAgentIsSavingFamilyState } from '@/object-core/agents/states/coreAgentIsSavingFamilyState';
import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentDraftError } from '@/object-core/agents/utils/getCoreAgentDraftError';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsInitialDraftRoleFamilyState } from '@/settings/roles/states/settingsInitialDraftRoleFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  FindOneAgentDocument,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSaveCoreAgent = (agent: CoreAgent) => {
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const store = useStore();
  const coreAgentIsSaving = useAtomFamilyStateValue(
    coreAgentIsSavingFamilyState,
    agent.id,
  );
  const setCoreAgentIsSaving = useSetAtomFamilyState(
    coreAgentIsSavingFamilyState,
    agent.id,
  );

  const { draft, resetDraft, resetDraftIfUnchanged } = useCoreAgentDraft(agent);
  const { roleId, isNewRole } = useCoreAgentRole(agent);
  const { isDraftDirty, isRoleDirty } = useCoreAgentDirtyState(agent);
  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId,
    isCreateMode: isNewRole,
  });

  const settingsInitialDraftRole = useAtomFamilyStateValue(
    settingsInitialDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setCoreAgentDiscardCount = useSetAtomFamilyState(
    coreAgentDiscardCountFamilyState,
    agent.id,
  );
  const setCoreAgentNewRoleId = useSetAtomFamilyState(
    coreAgentNewRoleIdFamilyState,
    agent.id,
  );

  const saveCoreAgent = async () => {
    if (store.get(coreAgentIsSavingFamilyState.atomFamily(agent.id))) {
      return;
    }

    const draftError = getCoreAgentDraftError(draft);

    if (isDefined(draftError)) {
      enqueueToast({ status: 'error', children: draftError });

      return;
    }

    setCoreAgentIsSaving(true);

    try {
      if (isRoleDirty) {
        await saveDraftRoleToDB();
      }

      if (isDraftDirty) {
        await updateAgent({
          variables: {
            input: {
              id: agent.id,
              description: draft.description,
              icon: draft.icon,
              avatarColor: draft.avatarColor,
              avatarShape: draft.avatarShape,
              modelId: draft.modelId,
              prompt: draft.prompt,
              modelConfiguration: draft.modelConfiguration,
              ...(!isDeeplyEqual(draft.triggers, agent.triggers) && {
                triggers: draft.triggers,
              }),
            },
          },
        });
        resetDraftIfUnchanged(draft);
      }

      if (isRoleDirty && isNewRole) {
        await apolloClient.query({
          query: FindOneAgentDocument,
          variables: { id: agent.id },
          fetchPolicy: 'network-only',
        });
        setCoreAgentNewRoleId(undefined);
      }
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setCoreAgentIsSaving(false);
    }
  };

  const discardCoreAgentChanges = () => {
    resetDraft();
    setCoreAgentDiscardCount((discardCount) => discardCount + 1);

    if (isDefined(settingsInitialDraftRole)) {
      setSettingsDraftRole(settingsInitialDraftRole);
    }
  };

  return {
    isSaving: coreAgentIsSaving,
    saveCoreAgent,
    discardCoreAgentChanges,
  };
};
