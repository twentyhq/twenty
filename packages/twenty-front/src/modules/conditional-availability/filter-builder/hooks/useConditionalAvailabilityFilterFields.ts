import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { getConditionalAvailabilityFilterFields } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterFields';
import { getConditionalAvailabilityRecordFilterFields } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityRecordFilterFields';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useIcons } from 'twenty-ui/icon/provider';
import { GetRolesDocument } from '~/generated-metadata/graphql';

export const useConditionalAvailabilityFilterFields = ({
  objectMetadataId,
}: {
  objectMetadataId: string | null | undefined;
}): ConditionalAvailabilityFilterField[] => {
  const { data } = useQuery(GetRolesDocument);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();

  return [
    ...getConditionalAvailabilityFilterFields({
      roles: data?.getRoles ?? [],
      workspaceMembers: currentWorkspaceMembers,
    }),
    ...getConditionalAvailabilityRecordFilterFields({
      objectMetadataId,
      objectMetadataItems,
      workspaceMembers: currentWorkspaceMembers,
      getIcon,
    }),
  ];
};
