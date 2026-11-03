import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { settingsRoleSaveSubmissionFamilyState } from '@/settings/roles/states/settingsRoleSaveSubmissionFamilyState';
import { useApolloClient } from '@apollo/client/react';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { applyCoreAgentPermissionIntent } from '@/object-core/agents/utils/applyCoreAgentPermissionIntent';
import { isCoreAgentRoleEditable } from '@/object-core/agents/utils/isCoreAgentRoleEditable';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { useReconcileCoreAgentEditSession } from '@/object-core/agents/hooks/useReconcileCoreAgentEditSession';
import { reconcileRoleDraft } from '@/settings/roles/role/utils/reconcileRoleDraft';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useStore } from 'jotai';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import {
  FindOneAgentDocument,
  PermissionFlagType,
  GetRolesDocument,
} from '~/generated-metadata/graphql';

export const useRefreshCoreAgentEditSession = ({
  agentId,
}: { agentId?: string } = {}) => {
  const store = useStore();
  const client = useApolloClient();
  const {
    agentId: sessionAgentId,
    scopeId,
    sessionAtom,
  } = useCoreAgentEditScope(agentId);
  const { reconcileAgent } = useReconcileCoreAgentEditSession({
    agentId: sessionAgentId,
  });

  const refreshCoreAgentEditSession = async () => {
    const canReadRoles = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.ROLES
    ];
    const editedRoleId = store.get(sessionAtom)?.roleId;
    const hasUnconfirmedRoleWrites =
      isDefined(editedRoleId) &&
      isDefined(
        store.get(
          settingsRoleSaveSubmissionFamilyState.getAtom(editedRoleId, scopeId),
        ),
      );
    const [agentResult, rolesResult] = await Promise.allSettled([
      client.query({
        query: FindOneAgentDocument,
        variables: { id: sessionAgentId },
        fetchPolicy: 'network-only',
      }),
      canReadRoles
        ? client.query({ query: GetRolesDocument, fetchPolicy: 'network-only' })
        : Promise.resolve(undefined),
    ]);

    if (
      agentResult.status === 'fulfilled' &&
      isDefined(agentResult.value.data?.findOneAgent)
    ) {
      reconcileAgent(agentResult.value.data.findOneAgent);
    }

    if (!canReadRoles && hasUnconfirmedRoleWrites) {
      throw new CustomError(
        t`Saved role permissions could not be confirmed. Restore role access and try again.`,
      );
    }

    if (rolesResult.status === 'fulfilled' && isDefined(rolesResult.value)) {
      const session = store.get(sessionAtom);
      const roleId = session?.roleId;
      const role = rolesResult.value.data?.getRoles.find(
        ({ id }) => id === session?.agent.roleId,
      );
      const localDraft = isDefined(roleId)
        ? store.get(settingsDraftRoleFamilyState.getAtom(roleId, scopeId))
        : undefined;
      const localBase = isDefined(roleId)
        ? store.get(settingsDraftRoleBaseFamilyState.getAtom(roleId, scopeId))
        : undefined;
      const canRecoverInitialization =
        isDefined(role) &&
        isDefined(localDraft) &&
        !isDefined(localBase) &&
        role.id !== roleId &&
        isCoreAgentRoleEditable({
          role,
          agentId: sessionAgentId,
          workspaceCustomApplicationId: store.get(currentWorkspaceState.atom)
            ?.workspaceCustomApplication?.id,
        });

      if (isDefined(session?.agent.roleId) && !isDefined(role)) {
        throw new CustomError(
          t`The assigned role could not be confirmed. Try again.`,
        );
      }

      if (isDefined(role)) {
        const draftAtom = settingsDraftRoleFamilyState.getAtom(
          role.id,
          scopeId,
        );
        const baseAtom = settingsDraftRoleBaseFamilyState.getAtom(
          role.id,
          scopeId,
        );
        const draftRole = store.get(draftAtom);
        const baseRole = store.get(baseAtom);
        store.set(
          draftAtom,
          canRecoverInitialization && isDefined(localDraft)
            ? applyCoreAgentPermissionIntent({
                draftRole: localDraft,
                baseRole: localBase,
                assignedRole: role,
              })
            : reconcileRoleDraft({
                draftRole,
                baseRole,
                persistedRole: role,
                submittedRole: store.get(
                  settingsRoleSaveSubmissionFamilyState.getAtom(
                    role.id,
                    scopeId,
                  ),
                ),
              }),
        );
        store.set(baseAtom, role);
        store.set(settingsPersistedRoleFamilyState.atomFamily(role.id), role);
        if (canRecoverInitialization && isDefined(session)) {
          store.set(sessionAtom, { ...session, roleId: role.id });
        }
      }
    }

    if (
      (agentResult.status === 'fulfilled' &&
        !isDefined(agentResult.value.data?.findOneAgent)) ||
      (canReadRoles &&
        rolesResult.status === 'fulfilled' &&
        !isDefined(rolesResult.value?.data?.getRoles))
    ) {
      throw new CustomError(
        t`Saved changes could not be confirmed. Try again.`,
      );
    }

    for (const result of [agentResult, rolesResult]) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  };

  return { refreshCoreAgentEditSession };
};
