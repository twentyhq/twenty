import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/data-display';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useWorkspaceMemberOptions } from '@/settings/inbox/hooks/useWorkspaceMemberOptions';

const StyledList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  max-height: 220px;
  overflow-y: auto;
`;

const StyledRow = styled.label`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

// Who watches this inbox. This is the only thing standing between one team and
// another team's work, so it is an explicit list rather than a default.
export const SettingsInboxQueueMemberPicker = ({
  selectedUserWorkspaceIds,
  onChange,
}: {
  selectedUserWorkspaceIds: string[];
  onChange: (userWorkspaceIds: string[]) => void;
}) => {
  const { t } = useLingui();
  const { workspaceMemberOptions } = useWorkspaceMemberOptions();

  const toggleMember = (userWorkspaceId: string) => {
    onChange(
      selectedUserWorkspaceIds.includes(userWorkspaceId)
        ? selectedUserWorkspaceIds.filter((id) => id !== userWorkspaceId)
        : [...selectedUserWorkspaceIds, userWorkspaceId],
    );
  };

  if (workspaceMemberOptions.length === 0) {
    return <StyledEmpty>{t`Nobody to add yet`}</StyledEmpty>;
  }

  return (
    <StyledList>
      {workspaceMemberOptions.map((workspaceMemberOption) => (
        <StyledRow key={workspaceMemberOption.userWorkspaceId}>
          <Checkbox
            checked={selectedUserWorkspaceIds.includes(
              workspaceMemberOption.userWorkspaceId,
            )}
            onChange={() => toggleMember(workspaceMemberOption.userWorkspaceId)}
            variant={CheckboxVariant.Primary}
          />
          <Avatar
            avatarUrl={workspaceMemberOption.avatarUrl}
            placeholder={workspaceMemberOption.label}
            size="sm"
            type="rounded"
          />
          <StyledName>{workspaceMemberOption.label}</StyledName>
        </StyledRow>
      ))}
    </StyledList>
  );
};
