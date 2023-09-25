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

import { CommandGroup } from './CommandGroup';
import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
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
        <StyledEmpty>No results found.</StyledEmpty>
        <CommandGroup heading="Create">
          {matchingCreateCommand.length === 1 &&
            matchingCreateCommand.map((cmd) => (
              <CommandMenuItem
                to={cmd.to}
                key={cmd.label}
                Icon={cmd.Icon}
                label={cmd.label}
                onClick={cmd.onCommandClick}
                shortcuts={cmd.shortcuts || []}
              />
            ))}
        </CommandGroup>
        <CommandGroup heading="Navigate">
          {matchingNavigateCommand.length === 1 &&
            matchingNavigateCommand.map((cmd) => (
              <CommandMenuItem
                to={cmd.to}
                key={cmd.label}
                label={cmd.label}
                onClick={cmd.onCommandClick}
                shortcuts={cmd.shortcuts || []}
              />
            ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {people.map((person) => (
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
        </CommandGroup>
        <CommandGroup heading="Companies">
          {companies.map((company) => (
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
        </CommandGroup>
        <CommandGroup heading="Notes">
          {activities.map((activity) => (
            <CommandMenuItem
              Icon={IconNotes}
              key={activity.id}
              label={activity.title ?? ''}
              onClick={() => openActivityRightDrawer(activity.id)}
            />
          ))}
        </CommandGroup>
      </StyledList>
    </StyledDialog>
  );
};
