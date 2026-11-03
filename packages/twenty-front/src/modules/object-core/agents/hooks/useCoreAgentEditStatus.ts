import { getCoreAgentScheduleDraftValidationError } from '@/object-core/agents/utils/getCoreAgentScheduleDraftValidationError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { getCoreAgentDraftValidationError } from '@/object-core/agents/utils/getCoreAgentDraftValidationError';
import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useCoreAgentEditStatus = ({
  agentId,
}: { agentId?: string } = {}) => {
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const session = useAtomValue(sessionAtom);
  const roleId = session?.roleId ?? '';
  const draftRole = useAtomValue(
    settingsDraftRoleFamilyState.getAtom(roleId, scopeId),
  );
  const roleBase = useAtomValue(
    settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId),
  );
  const persistedRole = useAtomValue(
    settingsPersistedRoleFamilyState.atomFamily(roleId),
  );
  const workspace = useAtomValue(currentWorkspaceState.atom);
  const permissionFlags = useAtomValue(permissionFlagMapSelector.atom);
  const isLocalRole =
    isDefined(session?.roleId) && !isDefined(session?.agent.roleId);
  const isRoleDirty =
    isDefined(session?.roleId) &&
    draftRole.id === roleId &&
    (isLocalRole ||
      Object.keys(
        getRoleDirtyFields({
          draftRole,
          persistedRole: roleBase ?? persistedRole,
        }),
      ).length > 0);
  const isSettingsDirty =
    isDefined(session) && !isDeeplyEqual(session.draft, session.confirmed);
  const isEditable =
    isDefined(session) &&
    permissionFlags[PermissionFlagType.AI_SETTINGS] &&
    !session.agent.isSystem &&
    getIsMetadataItemCustom(
      session.agent,
      workspace?.workspaceCustomApplication?.id,
    );
  const isRoleEditable =
    isEditable &&
    permissionFlags[PermissionFlagType.ROLES] &&
    (isLocalRole ||
      isCoreAgentRoleEditable({
        role: persistedRole,
        agentId: sessionAgentId,
        workspaceCustomApplicationId: workspace?.workspaceCustomApplication?.id,
      }));
  const hasRoleConflict =
    isDefined(session?.agent.roleId) &&
    session?.roleId !== session.agent.roleId;
  const scheduleValidationError = isDefined(session)
    ? getCoreAgentScheduleDraftValidationError(session)
    : null;
  const validationError = hasRoleConflict
    ? t`The assigned role changed. Discard settings and try again.`
    : isDefined(session)
      ? (getCoreAgentDraftValidationError(session.draft) ??
        scheduleValidationError)
      : null;
  const isDirty =
    isSettingsDirty || isRoleDirty || isDefined(scheduleValidationError);

  return {
    session,
    roleId,
    draftRole,
    persistedRole,
    isEditable,
    isReadonlyMode: !isEditable,
    isRoleEditable,
    canReadRoles: permissionFlags[PermissionFlagType.ROLES],
    canPrepareRole:
      isEditable &&
      permissionFlags[PermissionFlagType.ROLES] &&
      !isDefined(session?.roleId) &&
      !session?.isSaving,
    isRoleDirty,
    isDirty,
    validationError,
    isSaving: session?.isSaving ?? false,
    error: session?.error,
    resetVersion: session?.resetVersion ?? 0,
    canSave:
      isEditable &&
      isDirty &&
      !session?.isSaving &&
      !isDefined(validationError) &&
      !hasRoleConflict &&
      (!isRoleDirty || isRoleEditable),
  };
};
