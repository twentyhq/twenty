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
import { CommandType } from '../types/Command';

import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledList,
} from './CommandMenuStyles';

export function CommandMenu() {
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

  const matchingNavigateCommand = commandMenuCommands.find(
    (cmd) =>
      cmd.shortcuts?.join('') === search?.toUpperCase() &&
      cmd.type === CommandType.Navigate,
  );

  const matchingCreateCommand = commandMenuCommands.find(
    (cmd) =>
      cmd.shortcuts?.join('') === search?.toUpperCase() &&
      cmd.type === CommandType.Create,
  );

  return (
    <StyledDialog
      open={isCommandMenuOpened}
      onOpenChange={(opened) => {
        if (!opened) {
          closeCommandMenu();
        }
      }}
      label="Global Command Menu"
      shouldFilter={false}
    >
      <StyledInput
        placeholder="Search"
        value={search}
        onValueChange={setSearch}
      />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>
        {!matchingCreateCommand && (
          <StyledGroup heading="Create">
            {commandMenuCommands
              .filter((cmd) => cmd.type === CommandType.Create)
              .map((cmd) => (
                <CommandMenuItem
                  key={cmd.label}
                  to={cmd.to}
                  label={cmd.label}
                  Icon={cmd.Icon}
                  shortcuts={cmd.shortcuts || []}
                  onClick={cmd.onCommandClick}
                />
              ))}
          </StyledGroup>
        )}
        {matchingCreateCommand && (
          <StyledGroup heading="Create">
            <CommandMenuItem
              key={matchingCreateCommand.label}
              to={matchingCreateCommand.to}
              label={matchingCreateCommand.label}
              Icon={matchingCreateCommand.Icon}
              shortcuts={matchingCreateCommand.shortcuts || []}
              onClick={matchingCreateCommand.onCommandClick}
            />
          </StyledGroup>
        )}
        {matchingNavigateCommand && (
          <StyledGroup heading="Navigate">
            <CommandMenuItem
              to={matchingNavigateCommand.to}
              label={matchingNavigateCommand.label}
              shortcuts={matchingNavigateCommand.shortcuts}
              key={matchingNavigateCommand.label}
            />
          </StyledGroup>
        )}
        {!!people.length && (
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
        {!!companies.length && (
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
        {!!activities.length && (
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
        {!matchingNavigateCommand && (
          <StyledGroup heading="Navigate">
            {commandMenuCommands
              .filter(
                (cmd) =>
                  (cmd.shortcuts?.join('').includes(search?.toUpperCase()) ||
                    cmd.label?.toUpperCase().includes(search?.toUpperCase())) &&
                  cmd.type === CommandType.Navigate,
              )
              .map((cmd) => (
                <CommandMenuItem
                  key={cmd.shortcuts?.join('') ?? ''}
                  to={cmd.to}
                  label={cmd.label}
                  shortcuts={cmd.shortcuts}
                />
              ))}
          </StyledGroup>
        )}
      </StyledList>
    </StyledDialog>
  );
}
