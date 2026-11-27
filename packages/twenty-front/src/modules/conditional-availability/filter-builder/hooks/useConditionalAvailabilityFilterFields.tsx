import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPhone, IconUser, IconUserCircle } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { GetRolesDocument } from '~/generated-metadata/graphql';

export const useConditionalAvailabilityFilterFields =
  (): ConditionalAvailabilityFilterField[] => {
    const { t } = useLingui();
    const { data } = useQuery(GetRolesDocument);
    const currentWorkspaceMembers = useAtomStateValue(
      currentWorkspaceMembersState,
    );

    const roleOptions = (data?.getRoles ?? []).flatMap((role) =>
      role.canBeAssignedToUsers && isDefined(role.universalIdentifier)
        ? [{ value: role.universalIdentifier, label: role.label }]
        : [],
    );

    const workspaceMemberOptions = currentWorkspaceMembers.map(
      (workspaceMember) => {
        const label =
          `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim();

        return {
          value: workspaceMember.id,
          label,
          LeftComponent: (
            <Avatar
              shape="circle"
              size="md"
              name={label}
              src={workspaceMember.avatarUrl}
              colorSeed={workspaceMember.id}
            />
          ),
        };
      },
    );

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
