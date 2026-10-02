import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { IconLock, IconPlus, IconUsers } from 'twenty-ui/icon';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { RecordSharingAccessSelect } from '@/object-record/record-sharing/components/RecordSharingAccessSelect';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { SidePanelShareRecordDropdownItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordDropdownItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const StyledRecipients = styled.div`
  max-height: 240px;
  overflow-y: auto;
`;

type SidePanelShareRecordAddPeopleItemProps = {
  itemId: string;
  sharing: NonNullable<ReturnType<typeof useRecordSharing>['sharing']>;
  saving: boolean;
  setShare: ReturnType<typeof useRecordSharing>['setShare'];
};

export const SidePanelShareRecordAddPeopleItem = ({
  itemId,
  sharing,
  saving,
  setShare,
}: SidePanelShareRecordAddPeopleItemProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const [search, setSearch] = useState('');
  const [invitationAccessLevel, setInvitationAccessLevel] = useState(
    RecordShareAccessLevel.READ,
  );
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.trim().toLowerCase());
  const isAlreadyShared = (principalId: string) =>
    sharing.shares.some((share) => share.principalId === principalId);
  const availableMembers = currentWorkspaceMembers.filter(
    (member) =>
      !isAlreadyShared(member.id) &&
      matchesSearch(
        `${member.name.firstName} ${member.name.lastName} ${member.userEmail}`,
      ),
  );
  const availableRoles = sharing.roles.filter(
    (role) => !isAlreadyShared(role.id) && matchesSearch(role.label),
  );

  return (
    <SidePanelShareRecordDropdownItem
      itemId={itemId}
      label={t`Add people or roles`}
      Icon={IconPlus}
      disabled={saving}
      type="picker"
      width={320}
    >
      <Dropdown.Search
        value={search}
        onValueChange={setSearch}
        placeholder={t`Search people or roles`}
      />
      <Dropdown.Section>
        <RecordSharingAccessSelect
          label={t`Invitation access`}
          text={t`Invite as`}
          value={invitationAccessLevel}
          disabled={saving}
          onChange={setInvitationAccessLevel}
          closeOnSelect={false}
        />
      </Dropdown.Section>
      <Dropdown.Separator />
      <StyledRecipients>
        <Dropdown.Section>
          {availableMembers.length === 0 && availableRoles.length === 0 && (
            <Dropdown.Empty>{t`No matching people or roles`}</Dropdown.Empty>
          )}
          {availableMembers.map((member) => (
            <Dropdown.ActionItem
              key={member.id}
              startIcon={<IconUsers />}
              description={member.userEmail}
              disabled={saving}
              onClick={() => {
                void setShare({
                  principal: { workspaceMemberId: member.id },
                  accessLevel: invitationAccessLevel,
                });
              }}
            >
              {`${member.name.firstName} ${member.name.lastName}`.trim() ||
                member.userEmail}
            </Dropdown.ActionItem>
          ))}
          {availableRoles.map((role) => (
            <Dropdown.ActionItem
              key={role.id}
              startIcon={<IconLock />}
              description={t`Role`}
              disabled={saving}
              onClick={() => {
                void setShare({
                  principal: { roleId: role.id },
                  accessLevel: invitationAccessLevel,
                });
              }}
            >
              {role.label}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </StyledRecipients>
    </SidePanelShareRecordDropdownItem>
  );
};
