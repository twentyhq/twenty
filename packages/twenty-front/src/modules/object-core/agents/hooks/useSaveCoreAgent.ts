import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useCoreAgentDraft } from '@/object-core/agents/hooks/useCoreAgentDraft';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { coreAgentFormSchema } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  FindOneAgentDocument,
  GetRolesDocument,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSaveCoreAgent = (agent: CoreAgent) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const apolloClient = useApolloClient();
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const [isSaving, setIsSaving] = useState(false);

  const { draft, resetDraft } = useCoreAgentDraft(agent);
  const { roleId, isNewRole } = useCoreAgentRole(agent);
  const { isDraftDirty, isRoleDirty } = useCoreAgentDirtyState(agent);
  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId,
    isCreateMode: isNewRole,
  });

  const settingsDraftRoleBase = useAtomFamilyStateValue(
    settingsDraftRoleBaseFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRoleBase = useSetAtomFamilyState(
    settingsDraftRoleBaseFamilyState,
    roleId,
  );
  const setSettingsPersistedRole = useSetAtomFamilyState(
    settingsPersistedRoleFamilyState,
    roleId,
  );
  const setCoreAgentNewRoleId = useSetAtomFamilyState(
    coreAgentNewRoleIdFamilyState,
    agent.id,
  );

  const getDraftError = () => {
    const validation = coreAgentFormSchema.safeParse(draft);

    if (validation.success) {
      return undefined;
    }

    const [issue] = validation.error.issues;

    switch (issue?.path[0]) {
      case 'label':
        return t`Agent name cannot be empty`;
      case 'prompt':
        return t`Instructions cannot be empty`;
      default:
        return issue?.message;
    }
  };

  const replaceDraftRoleWithSavedRole = async () => {
    const { data } = await apolloClient.query({
      query: GetRolesDocument,
      fetchPolicy: 'network-only',
    });
    const savedRole = data?.getRoles.find((role) => role.id === roleId);

    if (!isDefined(savedRole)) {
      return;
    }

    setSettingsPersistedRole(savedRole);
    setSettingsDraftRoleBase(savedRole);
    setSettingsDraftRole(savedRole);
  };

  const saveCoreAgent = async () => {
    const draftError = getDraftError();

    if (isDefined(draftError)) {
      enqueueToast({ status: 'error', children: draftError });

      return;
    }

    setIsSaving(true);

    try {
      if (isRoleDirty) {
        await saveDraftRoleToDB();
        await replaceDraftRoleWithSavedRole();
      }

      if (isDraftDirty) {
        await updateAgent({
          variables: {
            input: {
              id: agent.id,
              name: draft.name || '',
              label: draft.label,
              description: draft.description,
              icon: draft.icon,
              modelId: draft.modelId,
              prompt: draft.prompt,
              modelConfiguration: draft.modelConfiguration,
              ...(!isDeeplyEqual(draft.triggers, agent.triggers) && {
                triggers: draft.triggers,
              }),
            },
          },
        });
        resetDraft();
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
      setIsSaving(false);
    }
  };

  const discardCoreAgentChanges = () => {
    resetDraft();

    if (isDefined(settingsDraftRoleBase)) {
      setSettingsDraftRole(settingsDraftRoleBase);
    }
  };

  return {
    isSaving,
    saveCoreAgent,
    discardCoreAgentChanges,
  };
};
