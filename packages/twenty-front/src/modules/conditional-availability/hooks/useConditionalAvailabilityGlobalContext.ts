import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/conditional-availability';

export const useConditionalAvailabilityGlobalContext =
  (): ConditionalAvailabilityGlobalContext => {
    const featureFlags = useWorkspaceFeatureFlagsMap();
    const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
    const currentWorkspaceMember = useAtomStateValue(
      currentWorkspaceMemberState,
    );

    const assignedRoleUniversalIdentifier =
      currentWorkspaceMember?.roles?.at(0)?.universalIdentifier;
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    return useMemo(
      () => ({
        featureFlags,
        permissionFlags: permissionFlagMap,
        currentRole: isNonEmptyString(assignedRoleUniversalIdentifier)
          ? { universalIdentifier: assignedRoleUniversalIdentifier }
          : null,
        currentWorkspaceMember: isNonEmptyString(currentWorkspaceMemberId)
          ? { id: currentWorkspaceMemberId }
          : null,
      }),
      [
        featureFlags,
        permissionFlagMap,
        assignedRoleUniversalIdentifier,
        currentWorkspaceMemberId,
      ],
    );
  };
