import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { getConditionalAvailabilityFilterFields } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterFields';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { GetRolesDocument } from '~/generated-metadata/graphql';

export const useConditionalAvailabilityFilterFields =
  (): ConditionalAvailabilityFilterField[] => {
    const { data } = useQuery(GetRolesDocument);
    const currentWorkspaceMembers = useAtomStateValue(
      currentWorkspaceMembersState,
    );

    return getConditionalAvailabilityFilterFields({
      roles: data?.getRoles ?? [],
      workspaceMembers: currentWorkspaceMembers,
    });
  };
