import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const getConditionalAvailabilityWorkspaceMemberOptions = ({
  workspaceMembers,
}: {
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'avatarUrl'>[];
}): SelectOption<string>[] =>
  workspaceMembers.map((workspaceMember) => {
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
  });
