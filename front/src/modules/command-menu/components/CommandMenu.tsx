import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { CommandMenuSelectableListEffect } from '@/command-menu/components/CommandMenuSelectableListEffect';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { Person } from '@/people/types/Person';
import { IconNotes } from '@/ui/display/icon';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
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
  const { toggleCommandMenu, closeCommandMenu } = useCommandMenu();

  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');
  const commandMenuCommands = useRecoilValue(commandMenuCommandsState);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      setSearch('');
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [toggleCommandMenu, setSearch],
  );

  useScopedHotkeys(
    'esc',
    () => {
      setSearch('');
      closeCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [toggleCommandMenu, setSearch],
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

  const selectableItemIds = matchingCreateCommand
    .map((cmd) => cmd.id)
    .concat(matchingNavigateCommand.map((cmd) => cmd.id))
    .concat(people.map((person) => person.id))
    .concat(companies.map((company) => company.id))
    .concat(activities.map((activity) => activity.id));

  return (
    isCommandMenuOpened && (
      <StyledDialog>
        <StyledInput
          value={search}
          placeholder="Search"
          onChange={handleSearchChange}
        />
        <StyledList>
          <CommandMenuSelectableListEffect
            selectableItemIds={selectableItemIds}
          />
          <SelectableList
            selectableListId="command-menu-list"
            selectableItemIds={selectableItemIds}
          >
            {!matchingCreateCommand.length &&
              !matchingNavigateCommand.length &&
              !people.length &&
              !companies.length &&
              !activities.length && <StyledEmpty>No results found</StyledEmpty>}
            <CommandGroup heading="Create">
              {matchingCreateCommand.map((cmd) => (
                <SelectableItem itemId={cmd.id} key={cmd.id}>
                  <CommandMenuItem
                    to={cmd.to}
                    key={cmd.id}
                    Icon={cmd.Icon}
                    label={cmd.label}
                    onClick={cmd.onCommandClick}
                    firstHotKey={cmd.firstHotKey}
                    secondHotKey={cmd.secondHotKey}
                  />
                </SelectableItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Navigate">
              {matchingNavigateCommand.map((cmd) => (
                <SelectableItem itemId={cmd.id} key={cmd.id}>
                  <CommandMenuItem
                    to={cmd.to}
                    key={cmd.id}
                    label={cmd.label}
                    Icon={cmd.Icon}
                    onClick={cmd.onCommandClick}
                    firstHotKey={cmd.firstHotKey}
                    secondHotKey={cmd.secondHotKey}
                  />
                </SelectableItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="People">
              {people.map((person) => (
                <SelectableItem itemId={person.id} key={person.id}>
                  <CommandMenuItem
                    key={person.id}
                    to={`object/person/${person.id}`}
                    label={person.name.firstName + ' ' + person.name.lastName}
                    Icon={() => (
                      <Avatar
                        type="rounded"
                        avatarUrl={null}
                        colorId={person.id}
                        placeholder={
                          person.name.firstName + ' ' + person.name.lastName
                        }
                      />
                    )}
                  />
                </SelectableItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Companies">
              {companies.map((company) => (
                <SelectableItem itemId={company.id} key={company.id}>
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
                </SelectableItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Notes">
              {activities.map((activity) => (
                <SelectableItem itemId={activity.id} key={activity.id}>
                  <CommandMenuItem
                    Icon={IconNotes}
                    key={activity.id}
                    label={activity.title ?? ''}
                    onClick={() => openActivityRightDrawer(activity.id)}
                  />
                </SelectableItem>
              ))}
            </CommandGroup>
          </SelectableList>
        </StyledList>
      </StyledDialog>
    )
  );
};
