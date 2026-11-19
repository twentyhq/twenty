import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';

type ConditionalAvailabilityWorkspaceMemberSelectProps = {
  dropdownId: string;
  values: string[];
  isMultiple: boolean;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityWorkspaceMemberSelect = ({
  dropdownId,
  values,
  isMultiple,
  onChange,
}: ConditionalAvailabilityWorkspaceMemberSelectProps) => {
  const { t } = useLingui();
  const { isReadOnly } = useConditionalAvailabilityEditorContext();

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

  const getValueLabel = (value: string) => {
    const workspaceMember = currentWorkspaceMembers.find(
      (candidate) => candidate.id === value,
    );

    if (isDefined(workspaceMember)) {
      return getWorkspaceMemberNameOrEmail(workspaceMember);
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
      options={options}
      values={values}
      getValueLabel={getValueLabel}
      isMultiple={isMultiple}
      searchPlaceholder={t`Search members`}
      placeholder={isMultiple ? t`Select members` : t`Select a member`}
      isDisabled={isReadOnly}
      isLoading={false}
      onChange={onChange}
    />
  );
};
