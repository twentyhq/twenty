import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { getConditionalAvailabilityWorkspaceMemberOptions } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityWorkspaceMemberOptions';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPhone, IconUser, IconUserCircle } from 'twenty-ui/icon';
import { type Role } from '~/generated-metadata/graphql';

export const getConditionalAvailabilityFilterFields = ({
  roles,
  workspaceMembers,
}: {
  roles: Pick<Role, 'canBeAssignedToUsers' | 'universalIdentifier' | 'label'>[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'avatarUrl'>[];
}): ConditionalAvailabilityFilterField[] => {
  const roleOptions = roles.flatMap((role) =>
    role.canBeAssignedToUsers && isDefined(role.universalIdentifier)
      ? [{ value: role.universalIdentifier, label: role.label }]
      : [],
  );

  const workspaceMemberOptions =
    getConditionalAvailabilityWorkspaceMemberOptions({ workspaceMembers });

  return [
    {
      key: 'currentRole',
      label: msg`Role`,
      Icon: IconUserCircle,
      options: roleOptions,
    },
    {
      key: 'currentWorkspaceMember',
      label: msg`Workspace member`,
      Icon: IconUser,
      options: workspaceMemberOptions,
    },
    {
      key: 'device',
      label: msg`Device`,
      Icon: IconPhone,
      options: [
        { value: 'DESKTOP', label: t`Desktop` },
        { value: 'MOBILE', label: t`Mobile` },
      ],
    },
  ];
};
