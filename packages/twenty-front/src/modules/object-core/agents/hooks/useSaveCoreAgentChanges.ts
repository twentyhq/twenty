import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { settingsRoleSaveSubmissionFamilyState } from '@/settings/roles/states/settingsRoleSaveSubmissionFamilyState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { useRefreshCoreAgentEditSession } from '@/object-core/agents/hooks/useRefreshCoreAgentEditSession';
import { applyCoreAgentPermissionIntent } from '@/object-core/agents/utils/applyCoreAgentPermissionIntent';
import { getCoreAgentDraftValidationError } from '@/object-core/agents/utils/getCoreAgentDraftValidationError';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { useSaveDraftRoleToDB } from '@/settings/roles/role/hooks/useSaveDraftRoleToDB';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { CustomError, isDefined } from 'twenty-shared/utils';
import {
  EnsureAgentRoleDocument,
  PermissionFlagType,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';
import { getDirtyFields } from '~/utils/getDirtyFields';

export const useSaveCoreAgentChanges = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const [ensureAgentRole] = useMutation(EnsureAgentRoleDocument);
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const { saveDraftRoleToDB } = useSaveDraftRoleToDB({
    roleId: '',
    isCreateMode: false,
  });
  const { refreshCoreAgentEditSession } = useRefreshCoreAgentEditSession({
    agentId: sessionAgentId,
  });

  const saveCoreAgentChanges = async () => {
    const initialSession = store.get(sessionAtom);

    if (!isDefined(initialSession) || initialSession.isSaving) {
      return false;
    }

    store.set(sessionAtom, { ...initialSession, isSaving: true, error: null });
    let saveError: unknown;
    let requiresRefresh = false;
    const pendingRoleIds = new Set<string>();

    try {
      if (initialSession.requiresRefresh) {
        await refreshCoreAgentEditSession();
      }

      const submission = store.get(sessionAtom);
      const workspaceCustomApplicationId = store.get(currentWorkspaceState.atom)
        ?.workspaceCustomApplication?.id;
      const permissionFlags = store.get(permissionFlagMapSelector.atom);

      if (
        !isDefined(submission) ||
        !permissionFlags[PermissionFlagType.AI_SETTINGS] ||
        submission.agent.isSystem ||
        !getIsMetadataItemCustom(submission.agent, workspaceCustomApplicationId)
      ) {
        throw new CustomError(t`You cannot edit this agent.`);
      }

      const validationError = getCoreAgentDraftValidationError(
        submission.draft,
      );

      if (isDefined(validationError)) {
        throw new CustomError(validationError);
      }

      store.set(sessionAtom, {
        ...submission,
        submission: {
          settings: submission.draft,
          fieldRevisions: submission.fieldRevisions,
        },
      });

      const settingsChanges = getDirtyFields(
        submission.draft,
        submission.confirmed,
      );
      const roleId = submission.roleId;
      const roleDraft = isDefined(roleId)
        ? store.get(settingsDraftRoleFamilyState.getAtom(roleId, scopeId))
        : undefined;
      const roleBase = isDefined(roleId)
        ? (store.get(
            settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId),
          ) ?? store.get(settingsPersistedRoleFamilyState.atomFamily(roleId)))
        : undefined;
      const hasRoleChanges =
        isDefined(roleDraft) &&
        roleDraft.id === roleId &&
        (!isDefined(roleBase) ||
          Object.keys(
            getRoleDirtyFields({
              draftRole: roleDraft,
              persistedRole: roleBase,
            }),
          ).length > 0);

      if (hasRoleChanges && isDefined(roleDraft)) {
        if (!permissionFlags[PermissionFlagType.ROLES]) {
          throw new CustomError(t`You cannot edit role permissions.`);
        }

        if (
          isDefined(submission.agent.roleId) &&
          submission.agent.roleId !== roleId
        ) {
          throw new CustomError(
            t`The assigned role changed. Discard settings and try again.`,
          );
        }

        pendingRoleIds.add(roleDraft.id);
        store.set(
          settingsRoleSaveSubmissionFamilyState.getAtom(roleDraft.id, scopeId),
          roleDraft,
        );

        const { data } = await ensureAgentRole({
          variables: { agentId: sessionAgentId },
        });
        const assignedRole = data?.ensureAgentRole;

        if (
          !isCoreAgentRoleEditable({
            role: assignedRole,
            agentId: sessionAgentId,
            workspaceCustomApplicationId,
          }) ||
          !isDefined(assignedRole) ||
          (isDefined(submission.agent.roleId) && assignedRole.id !== roleId)
        ) {
          throw new CustomError(
            t`The assigned role could not be confirmed. Try again.`,
          );
        }

        const submittedRole = applyCoreAgentPermissionIntent({
          draftRole: roleDraft,
          baseRole: roleBase,
          assignedRole,
        });
        pendingRoleIds.add(assignedRole.id);
        store.set(
          settingsRoleSaveSubmissionFamilyState.getAtom(
            assignedRole.id,
            scopeId,
          ),
          submittedRole,
        );
        const latestRoleDraft = store.get(
          settingsDraftRoleFamilyState.getAtom(roleDraft.id, scopeId),
        );
        const latestSession = store.get(sessionAtom);
        store.set(
          settingsDraftRoleFamilyState.getAtom(assignedRole.id, scopeId),
          applyCoreAgentPermissionIntent({
            draftRole: latestRoleDraft,
            baseRole: roleBase,
            assignedRole,
            submittedRole: roleDraft,
          }),
        );
        store.set(
          settingsDraftRoleBaseFamilyState.getAtom(assignedRole.id, scopeId),
          assignedRole,
        );
        store.set(
          settingsPersistedRoleFamilyState.atomFamily(assignedRole.id),
          assignedRole,
        );

        if (isDefined(latestSession)) {
          store.set(sessionAtom, {
            ...latestSession,
            agent: { ...latestSession.agent, roleId: assignedRole.id },
            roleId: assignedRole.id,
          });
        }

        await saveDraftRoleToDB({
          draftRole: submittedRole,
          persistedRole: assignedRole,
        });
      }

      if (Object.keys(settingsChanges).length > 0) {
        const { data } = await updateAgent({
          variables: { input: { id: sessionAgentId, ...settingsChanges } },
        });

        if (data?.updateOneAgent.id !== sessionAgentId) {
          throw new CustomError(
            t`Saved settings could not be confirmed. Try again.`,
          );
        }
      }
    } catch (error) {
      saveError = error;
    }

    try {
      await refreshCoreAgentEditSession();
    } catch (error) {
      saveError ??= error;
      requiresRefresh = true;
    }

    const currentSession = store.get(sessionAtom);

    if (isDefined(currentSession?.roleId)) {
      pendingRoleIds.add(currentSession.roleId);
    }
    if (!requiresRefresh) {
      for (const roleId of pendingRoleIds) {
        store.set(
          settingsRoleSaveSubmissionFamilyState.getAtom(roleId, scopeId),
          undefined,
        );
      }
    }

    if (isDefined(currentSession)) {
      store.set(sessionAtom, {
        ...currentSession,
        isSaving: false,
        requiresRefresh,
        submission: requiresRefresh ? currentSession.submission : null,
        error: isDefined(saveError)
          ? saveError instanceof Error
            ? saveError.message
            : t`Settings could not be saved. Try again.`
          : null,
      });
    }

    return !isDefined(saveError);
  };

  return { saveCoreAgentChanges };
};
