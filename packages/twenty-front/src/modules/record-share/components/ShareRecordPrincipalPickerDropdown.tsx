import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import { IconUsers, useIcons } from 'twenty-ui/icon';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useShareableRoles } from '@/record-share/hooks/useShareableRoles';
import { type ShareRecordPrincipal } from '@/record-share/types/ShareRecordPrincipal';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type RecordShare,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type ShareRecordPrincipalPickerDropdownProps = {
  shares: Pick<RecordShare, 'principalId' | 'principalType'>[];
  onSelect: (principal: ShareRecordPrincipal) => void;
};

export const ShareRecordPrincipalPickerDropdown = ({
  shares,
  onSelect,
}: ShareRecordPrincipalPickerDropdownProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchFilter, setSearchFilter] = useState('');

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { roles } = useShareableRoles();

  const grantedPrincipalIds = new Set(shares.map((share) => share.principalId));
  const isEveryoneGranted = shares.some(
    (share) => share.principalType === RecordSharePrincipalType.EVERYONE,
  );

  const searchTerm = normalizeSearchText(searchFilter);
  const matchesSearch = (label: string) =>
    normalizeSearchText(label).includes(searchTerm);

  const everyoneLabel = t`Everyone`;

  const workspaceMembers = currentWorkspaceMembers
    .filter((workspaceMember) => !grantedPrincipalIds.has(workspaceMember.id))
    .map((workspaceMember) => ({
      ...workspaceMember,
      fullName:
        `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim(),
    }))
    .filter((workspaceMember) => matchesSearch(workspaceMember.fullName));

  const shareableRoles = roles.filter(
    (role) => !grantedPrincipalIds.has(role.id) && matchesSearch(role.label),
  );

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const hasNoResult =
    (isEveryoneGranted || !matchesSearch(everyoneLabel)) &&
    workspaceMembers.length === 0 &&
    shareableRoles.length === 0;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {!isEveryoneGranted && matchesSearch(everyoneLabel) && (
          <MenuItem
            LeftIcon={IconUsers}
            text={everyoneLabel}
            onClick={() =>
              onSelect({ label: everyoneLabel, shareWith: { everyone: true } })
            }
          />
        )}
        {workspaceMembers.map((workspaceMember) => (
          <MenuItemAvatar
            key={workspaceMember.id}
            avatar={{
              type: 'rounded',
              size: 'md',
              placeholder: workspaceMember.fullName,
              placeholderColorSeed: workspaceMember.id,
              avatarUrl: workspaceMember.avatarUrl,
            }}
            text={workspaceMember.fullName}
            contextualText={workspaceMember.userEmail}
            onClick={() =>
              onSelect({
                label: workspaceMember.fullName,
                shareWith: { workspaceMemberId: workspaceMember.id },
              })
            }
          />
        ))}
        {shareableRoles.map((role) => (
          <MenuItem
            key={role.id}
            LeftIcon={getIcon(role.icon, 'IconLock')}
            text={role.label}
            onClick={() =>
              onSelect({ label: role.label, shareWith: { roleId: role.id } })
            }
          />
        ))}
        {hasNoResult && <MenuItem disabled text={t`No Results`} />}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
