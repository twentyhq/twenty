import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconNotes } from '@/ui/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Avatar } from '@/users/components/Avatar';
import { getLogoUrlFromDomainName } from '~/utils';

import { useCommandMenu } from '../hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command, CommandType } from '../types/Command';

import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledList,
} from './CommandMenuStyles';

export const WrapperCommandMenu = ({
  values,
  people,
  companies,
  activities,
}: {
  values: Command[];
  people: Array<{
    __typename?: 'Person';
    id: string;
    phone?: string | null;
    email?: string | null;
    city?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName: string;
    avatarUrl?: string | null;
    createdAt: string;
  }>;
  companies: Array<{
    __typename?: 'Company';
    address: string;
    createdAt: string;
    domainName: string;
    employees?: number | null;
    linkedinUrl?: string | null;
    xUrl?: string | null;
    annualRecurringRevenue?: number | null;
    idealCustomerProfile: boolean;
    id: string;
    name: string;
    _activityCount: number;
    accountOwner?: {
      __typename?: 'User';
      id: string;
      email: string;
      displayName: string;
      avatarUrl?: string | null;
    } | null;
  }>;
  activities: Array<{
    __typename?: 'Activity';
    id: string;
    title?: string | null;
    body?: string | null;
  }>;
}) => {
  const { openCommandMenu, closeCommandMenu } = useCommandMenu();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');
  const commandMenuCommands = values;

  const peopleData = people.filter((i) =>
    search.length > 0
      ? (i.firstName
          ? i.firstName?.toLowerCase().includes(search.toLowerCase())
          : false) ||
        (i.lastName
          ? i.lastName?.toLowerCase().includes(search.toLowerCase())
          : false)
      : false,
  );

  const companyData = companies.filter((i) =>
    search.length > 0
      ? i.name
        ? i.name?.toLowerCase().includes(search.toLowerCase())
        : false
      : false,
  );

  const activityData = activities.filter((i) =>
    search.length > 0
      ? (i.title
          ? i.title?.toLowerCase().includes(search.toLowerCase())
          : false) ||
        (i.body ? i.body?.toLowerCase().includes(search.toLowerCase()) : false)
      : false,
  );

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      openCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [openCommandMenu],
  );

  const checkInShortcuts = (cmd: Command, search: string) => {
    if (cmd.shortcuts && cmd.shortcuts.length > 0) {
      return cmd.shortcuts
        .join('')
        .toLowerCase()
        .includes(search.toLowerCase());
    }
    return false;
  };

  const checkInLabels = (cmd: Command, search: string) => {
    if (cmd.label) {
      return cmd.label.toLowerCase().includes(search.toLowerCase());
    }
    return false;
  };

  const matchingNavigateCommand = commandMenuCommands.filter(
    (cmd) =>
      (search.length > 0
        ? checkInShortcuts(cmd, search) || checkInLabels(cmd, search)
        : true) && cmd.type === CommandType.Navigate,
  );

  const matchingCreateCommand = commandMenuCommands.filter(
    (cmd) =>
      (search.length > 0
        ? checkInShortcuts(cmd, search) || checkInLabels(cmd, search)
        : true) && cmd.type === CommandType.Create,
  );

  return (
    <StyledDialog
      open={isCommandMenuOpened}
      onOpenChange={(opened) => {
        if (!opened) {
          closeCommandMenu();
        }
      }}
      shouldFilter={false}
      label="Global Command Menu"
    >
      <StyledInput
        value={search}
        placeholder="Search"
        onValueChange={setSearch}
      />
      <StyledList>
        {matchingCreateCommand.length < 1 &&
          matchingNavigateCommand.length < 1 &&
          peopleData.length < 1 &&
          companyData.length < 1 &&
          activityData.length < 1 && (
            <StyledEmpty>No results found.</StyledEmpty>
          )}
        {matchingCreateCommand.length > 0 && (
          <StyledGroup heading="Create">
            {matchingCreateCommand.map((cmd) => (
              <CommandMenuItem
                to={cmd.to}
                key={cmd.label}
                Icon={cmd.Icon}
                label={cmd.label}
                onClick={cmd.onCommandClick}
                shortcuts={cmd.shortcuts || []}
              />
            ))}
          </StyledGroup>
        )}
        {matchingNavigateCommand.length > 0 && (
          <StyledGroup heading="Navigate">
            {matchingNavigateCommand.map((cmd) => (
              <CommandMenuItem
                to={cmd.to}
                key={cmd.label}
                label={cmd.label}
                onClick={cmd.onCommandClick}
                shortcuts={cmd.shortcuts || []}
              />
            ))}
          </StyledGroup>
        )}
        {peopleData.length > 0 && (
          <StyledGroup heading="People">
            {peopleData.map((person) => (
              <CommandMenuItem
                key={person.id}
                to={`person/${person.id}`}
                label={person.displayName}
                Icon={() => (
                  <Avatar
                    type="rounded"
                    avatarUrl={null}
                    colorId={person.id}
                    placeholder={person.displayName}
                  />
                )}
              />
            ))}
          </StyledGroup>
        )}
        {companyData.length > 0 && (
          <StyledGroup heading="Companies">
            {companyData.map((company) => (
              <CommandMenuItem
                key={company.id}
                label={company.name}
                to={`companies/${company.id}`}
                Icon={() => (
                  <Avatar
                    colorId={company.id}
                    placeholder={company.name}
                    avatarUrl={getLogoUrlFromDomainName(company.domainName)}
                  />
                )}
              />
            ))}
          </StyledGroup>
        )}
        {activityData.length > 0 && (
          <StyledGroup heading="Notes">
            {activityData.map((activity) => (
              <CommandMenuItem
                Icon={IconNotes}
                key={activity.id}
                label={activity.title ?? ''}
                onClick={() => openActivityRightDrawer(activity.id)}
              />
            ))}
          </StyledGroup>
        )}
      </StyledList>
    </StyledDialog>
  );
};
