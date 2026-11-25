import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { buildConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/utils/buildConditionalAvailabilityCurrentUserContext';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useMemo } from 'react';
import { type ConditionalAvailabilityCurrentUserContext } from 'twenty-shared/conditional-availability';

export const useConditionalAvailabilityCurrentUserContext =
  (): ConditionalAvailabilityCurrentUserContext => {
    const featureFlags = useWorkspaceFeatureFlagsMap();
    const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
    const currentWorkspaceMember = useAtomStateValue(
      currentWorkspaceMemberState,
    );

    return useMemo(
      () =>
        buildConditionalAvailabilityCurrentUserContext({
          featureFlags,
          permissionFlags: permissionFlagMap,
          currentWorkspaceMember,
        }),
      [featureFlags, permissionFlagMap, currentWorkspaceMember],
    );
  };
