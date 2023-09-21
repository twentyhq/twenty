import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconNotes } from '@/ui/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Avatar } from '@/users/components/Avatar';
import {
  QueryMode,
  useSearchActivityQuery,
  useSearchCompanyQuery,
  useSearchPeopleQuery,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

import { useCommandMenu } from '../hooks/useCommandMenu';
import { commandMenuCommandsState } from '../states/commandMenuCommandsState';
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

export const CommandMenu = () => {
  const { openCommandMenu, closeCommandMenu } = useCommandMenu();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');
  const commandMenuCommands = useRecoilValue(commandMenuCommandsState);

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      openCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [openCommandMenu],
  );

  const { data: peopleData } = useSearchPeopleQuery({
    variables: {
      where: {
        OR: [
          { firstName: { contains: search, mode: QueryMode.Insensitive } },
          { lastName: { contains: search, mode: QueryMode.Insensitive } },
        ],
      },
      limit: 3,
    },
  });
  const people = peopleData?.searchResults ?? [];

  const { data: companyData } = useSearchCompanyQuery({
    variables: {
      where: {
        OR: [{ name: { contains: search, mode: QueryMode.Insensitive } }],
      },
      limit: 3,
    },
  });

  const companies = companyData?.searchResults ?? [];

  const { data: activityData } = useSearchActivityQuery({
    variables: {
      where: {
        OR: [
          { title: { contains: search, mode: QueryMode.Insensitive } },
          { body: { contains: search, mode: QueryMode.Insensitive } },
        ],
      },
      limit: 3,
    },
  });

  const activities = activityData?.searchResults ?? [];

  const checkInShortcuts = (cmd: Command, search: string) => {
    if (cmd.shortcuts && cmd.shortcuts.length > 0) {
      return cmd.shortcuts
        .join('')
        .toLowerCase()
        .includes(search.toLowerCase());
    }
    return false;
  };

  const matchingNavigateCommand = commandMenuCommands.filter(
    (cmd) =>
      (search.length > 0
        ? checkInShortcuts(cmd, search) ||
          cmd.label.toLowerCase().includes(search.toLowerCase())
        : true) && cmd.type === CommandType.Navigate,
  );

  const matchingCreateCommand = commandMenuCommands.filter(
    (cmd) =>
      (search.length > 0
        ? checkInShortcuts(cmd, search) ||
          cmd.label.toLowerCase().includes(search.toLowerCase())
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
          people.length < 1 &&
          companies.length < 1 &&
          activities.length < 1 && <StyledEmpty>No results found.</StyledEmpty>}
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
        {people.length > 0 && (
          <StyledGroup heading="People">
            {people.map((person) => (
              <CommandMenuItem
                to={`person/${person.id}`}
                label={person.displayName}
                key={person.id}
                Icon={() => (
                  <Avatar
                    avatarUrl={null}
                    placeholder={person.displayName}
                    colorId={person.id}
                    type="rounded"
                  />
                )}
              />
            ))}
          </StyledGroup>
        )}
        {companies.length > 0 && (
          <StyledGroup heading="Companies">
            {companies.map((company) => (
              <CommandMenuItem
                to={`companies/${company.id}`}
                label={company.name}
                key={company.id}
                Icon={() => (
                  <Avatar
                    avatarUrl={getLogoUrlFromDomainName(company.domainName)}
                    colorId={company.id}
                    placeholder={company.name}
                  />
                )}
              />
            ))}
          </StyledGroup>
        )}
        {activities.length > 0 && (
          <StyledGroup heading="Notes">
            {activities.map((activity) => (
              <CommandMenuItem
                onClick={() => openActivityRightDrawer(activity.id)}
                label={activity.title ?? ''}
                key={activity.id}
                Icon={IconNotes}
              />
            ))}
          </StyledGroup>
        )}
      </StyledList>
    </StyledDialog>
  );
};
