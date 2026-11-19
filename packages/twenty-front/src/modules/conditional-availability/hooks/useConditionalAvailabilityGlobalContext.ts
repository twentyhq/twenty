import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { buildConditionalAvailabilityGlobalContext } from '@/conditional-availability/utils/buildConditionalAvailabilityGlobalContext';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useMemo } from 'react';
import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/types';

export const useConditionalAvailabilityGlobalContext =
  (): ConditionalAvailabilityGlobalContext => {
    const featureFlags = useWorkspaceFeatureFlagsMap();
    const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
    const currentWorkspaceMember = useAtomStateValue(
      currentWorkspaceMemberState,
    );

    return useMemo(
      () =>
        buildConditionalAvailabilityGlobalContext({
          featureFlags,
          permissionFlags: permissionFlagMap,
          currentWorkspaceMember,
        }),
      [featureFlags, permissionFlagMap, currentWorkspaceMember],
    );
  };
