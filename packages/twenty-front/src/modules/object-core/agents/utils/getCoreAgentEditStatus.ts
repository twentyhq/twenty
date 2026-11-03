import { getCoreAgentScheduleDraftValidationError } from '@/object-core/agents/utils/getCoreAgentScheduleDraftValidationError';
import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { getCoreAgentDraftValidationError } from '@/object-core/agents/utils/getCoreAgentDraftValidationError';
import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type GetCoreAgentEditStatusArgs = {
  agentId: string;
  session: CoreAgentEditSession | undefined;
  draftRole: RoleWithPartialMembers;
  roleBase: RoleWithPartialMembers | undefined;
  persistedRole: RoleWithPartialMembers | undefined;
  permissionFlags: Record<PermissionFlagType, boolean>;
  workspaceCustomApplicationId: string | undefined;
};

export const getCoreAgentEditStatus = ({
  agentId,
  session,
  draftRole,
  roleBase,
  persistedRole,
  permissionFlags,
  workspaceCustomApplicationId,
}: GetCoreAgentEditStatusArgs) => {
  const roleId = session?.roleId ?? '';
  const isLocalRole =
    isDefined(session?.roleId) && !isDefined(session?.agent.roleId);
  const isRoleDirty =
    isDefined(session?.roleId) &&
    draftRole.id === roleId &&
    (isLocalRole ||
      isNonEmptyArray(
        Object.keys(
          getRoleDirtyFields({
            draftRole,
            persistedRole: roleBase ?? persistedRole,
          }),
        ),
      ));
  const isSettingsDirty =
    isDefined(session) && !isDeeplyEqual(session.draft, session.confirmed);
  const isEditable =
    isDefined(session) &&
    permissionFlags[PermissionFlagType.AI_SETTINGS] &&
    !session.agent.isSystem &&
    getIsMetadataItemCustom(session.agent, workspaceCustomApplicationId);
  const isRoleEditable =
    isEditable &&
    permissionFlags[PermissionFlagType.ROLES] &&
    (isLocalRole ||
      isCoreAgentRoleEditable({
        role: persistedRole,
        agentId,
        workspaceCustomApplicationId,
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
