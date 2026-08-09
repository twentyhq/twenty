import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Avatar } from 'twenty-ui/data-display';
import { IconPlus, IconX } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { SettingsWorkspaceMemberPickerDropdown } from '@/settings/components/SettingsWorkspaceMemberPickerDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const INBOX_QUEUE_MEMBER_DROPDOWN_ID = 'inbox-queue-member-select';

const StyledList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
`;

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-of-type {
    border-bottom: none;
  }
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledEmail = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledEmpty = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledAddRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

// Who watches this inbox. This is the only thing standing between one team and
// another team's work, so it is an explicit list rather than a default.
export const SettingsInboxQueueMemberPicker = ({
  selectedWorkspaceMemberIds,
  onChange,
}: {
  selectedWorkspaceMemberIds: string[];
  onChange: (workspaceMemberIds: string[]) => void;
}) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const selectedWorkspaceMembers = selectedWorkspaceMemberIds
    .map((workspaceMemberId) =>
      currentWorkspaceMembers.find(({ id }) => id === workspaceMemberId),
    )
    .filter((workspaceMember) => workspaceMember !== undefined);

  return (
    <>
      {selectedWorkspaceMembers.length === 0 ? (
        <StyledEmpty>{t`Nobody watches this inbox yet`}</StyledEmpty>
      ) : (
        <StyledList>
          {selectedWorkspaceMembers.map((workspaceMember) => {
            const fullName =
              `${workspaceMember.name.firstName ?? ''} ${workspaceMember.name.lastName ?? ''}`.trim();

            return (
              <StyledRow key={workspaceMember.id}>
                <Avatar
                  avatarUrl={getAbsoluteImageUrl(workspaceMember.avatarUrl)}
                  placeholder={fullName}
                  placeholderColorSeed={workspaceMember.id}
                  size="sm"
                  type="rounded"
                />
                <StyledName>{fullName}</StyledName>
                <StyledEmail>{workspaceMember.userEmail}</StyledEmail>
                <LightIconButton
                  Icon={IconX}
                  accent="tertiary"
                  onClick={() =>
                    onChange(
                      selectedWorkspaceMemberIds.filter(
                        (id) => id !== workspaceMember.id,
                      ),
                    )
                  }
                />
              </StyledRow>
            );
          })}
        </StyledList>
      )}
      <StyledAddRow>
        <Dropdown
          dropdownId={INBOX_QUEUE_MEMBER_DROPDOWN_ID}
          dropdownOffset={{ x: 0, y: 4 }}
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={t`Add member`}
              variant="secondary"
              size="small"
            />
          }
          dropdownComponents={
            <SettingsWorkspaceMemberPickerDropdown
              excludedWorkspaceMemberIds={selectedWorkspaceMemberIds}
              onSelect={(workspaceMember) => {
                closeDropdown(INBOX_QUEUE_MEMBER_DROPDOWN_ID);
                onChange([...selectedWorkspaceMemberIds, workspaceMember.id]);
              }}
            />
          }
        />
      </StyledAddRow>
    </>
  );
};
