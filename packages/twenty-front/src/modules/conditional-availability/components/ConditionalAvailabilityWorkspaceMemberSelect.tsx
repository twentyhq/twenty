import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconUser } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilityWorkspaceMemberSelectProps = {
  dropdownId: string;
  values: string[];
  isMultiple: boolean;
  withMe: boolean;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityWorkspaceMemberSelect = ({
  dropdownId,
  values,
  isMultiple,
  withMe,
  onChange,
}: ConditionalAvailabilityWorkspaceMemberSelectProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceDeletedMembers = useAtomStateValue(
    currentWorkspaceDeletedMembersState,
  );

  const options = currentWorkspaceMembers
    .map((workspaceMember) => {
      const workspaceMemberName =
        getWorkspaceMemberNameOrEmail(workspaceMember);

      return {
        value: workspaceMember.id,
        label: workspaceMemberName,
        startIcon: (
          <Avatar
            shape="circle"
            size="md"
            name={workspaceMemberName}
            colorSeed={workspaceMember.id}
            src={workspaceMember.avatarUrl}
          />
        ),
      };
    })
    .sort((firstOption, secondOption) =>
      firstOption.label.localeCompare(secondOption.label),
    );

  const meOption = {
    value: CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE,
    label: t`Me`,
    startIcon: <IconUser size={theme.icon.size.md} />,
  };

  const getUnknownValueLabel = (value: string) => {
    if (value === meOption.value) {
      return meOption.label;
    }

    const deletedWorkspaceMember = currentWorkspaceDeletedMembers.find(
      (candidate) => candidate.id === value,
    );

    if (isDefined(deletedWorkspaceMember)) {
      const deletedWorkspaceMemberName = getWorkspaceMemberNameOrEmail(
        deletedWorkspaceMember,
      );

      return t`${deletedWorkspaceMemberName} (deleted)`;
    }

    return t`Unknown member`;
  };

  return (
    <ConditionalAvailabilityOptionsSelect
      dropdownId={dropdownId}
      options={withMe ? [meOption, ...options] : options}
      values={values}
      getUnknownValueLabel={getUnknownValueLabel}
      isMultiple={isMultiple}
      searchPlaceholder={t`Search members`}
      placeholder={isMultiple ? t`Select members` : t`Select a member`}
      onChange={onChange}
    />
  );
};
