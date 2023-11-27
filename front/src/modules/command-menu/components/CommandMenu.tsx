import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { Person } from '@/people/types/Person';
import { IconNotes } from '@/ui/display/icon';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Avatar } from '@/users/components/Avatar';
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
  const { openCommandMenu, closeCommandMenu, toggleCommandMenu } =
    useCommandMenu();
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');
  const commandMenuCommands = useRecoilValue(commandMenuCommandsState);

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      setSearch('');
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [openCommandMenu, setSearch],
  );

  const { objects: people } = useFindManyObjectRecords<Person>({
    skip: !isCommandMenuOpened,
    objectNamePlural: 'people',
    filter: {
      or: [
        { name: { firstName: { ilike: `%${search}%` } } },
        { name: { firstName: { ilike: `%${search}%` } } },
      ],
    },
    limit: 3,
  });

  const { objects: companies } = useFindManyObjectRecords<Person>({
    skip: !isCommandMenuOpened,
    objectNamePlural: 'companies',
    filter: {
      name: { ilike: `%${search}%` },
    },
    limit: 3,
  });

  const { objects: activities } = useFindManyObjectRecords<Person>({
    skip: !isCommandMenuOpened,
    objectNamePlural: 'activities',
    filter: {
      or: [
        { title: { like: `%${search}%` } },
        { body: { like: `%${search}%` } },
      ],
    },
    limit: 3,
  });

  const checkInShortcuts = (cmd: Command, search: string) => {
    return (cmd.firstHotKey + (cmd.secondHotKey ?? ''))
      .toLowerCase()
      .includes(search.toLowerCase());
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
          {matchingCreateCommand.map((cmd) => (
            <CommandMenuItem
              to={cmd.to}
              key={cmd.label}
              Icon={cmd.Icon}
              label={cmd.label}
              onClick={cmd.onCommandClick}
              firstHotKey={cmd.firstHotKey}
              secondHotKey={cmd.secondHotKey}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="Navigate">
          {matchingNavigateCommand.map((cmd) => (
            <CommandMenuItem
              to={cmd.to}
              key={cmd.label}
              label={cmd.label}
              Icon={cmd.Icon}
              onClick={cmd.onCommandClick}
              firstHotKey={cmd.firstHotKey}
              secondHotKey={cmd.secondHotKey}
            />
          ))}
        </CommandGroup>
        <CommandGroup heading="People">
          {people.map((person) => (
            <CommandMenuItem
              key={person.id}
              to={`object/person/${person.id}`}
              label={person.name?.firstName + ' ' + person.name?.lastName}
              Icon={() => (
                <Avatar
                  type="rounded"
                  avatarUrl={person.avatarUrl}
                  colorId={person.id}
                  placeholder={
                    person.name?.firstName + ' ' + person.name?.lastName
                  }
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
              to={`object/company/${company.id}`}
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
