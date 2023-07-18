import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';

import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { useFilteredSearchPeopleQuery } from '@/people/queries';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/hotkey/types/AppHotkeyScope';
import { Avatar } from '@/users/components/Avatar';

import { useCommandMenu } from '../hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

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
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      openCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [openCommandMenu],
  );

  const people = useFilteredSearchPeopleQuery({
    searchFilter: search,
    selectedIds: [],
    limit: 3,
  });
  const companies = useFilteredSearchCompanyQuery({
    searchFilter: search,
    selectedIds: [],
    limit: 3,
  });

  /*
  TODO: Allow performing actions on page through CommandBar 

  import { useMatch, useResolvedPath } from 'react-router-dom';
  import { IconBuildingSkyscraper, IconUser } from '@/ui/icon';

  const createSection = (
    <StyledGroup heading="Create">
      <CommandMenuItem
        label="Create People"
        onClick={createPeople}
        icon={<IconUser />}
        shortcuts={
          !!useMatch({
            path: useResolvedPath('/people').pathname,
            end: true,
          })
            ? ['C']
            : []
        }
      />
      <CommandMenuItem
        label="Create Company"
        onClick={createCompany}
        icon={<IconBuildingSkyscraper />}
        shortcuts={
          !!useMatch({
            path: useResolvedPath('/companies').pathname,
            end: true,
          })
            ? ['C']
            : []
        }
      />
    </StyledGroup>
  );*/

  const theme = useTheme();

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
        {!!people.entitiesToSelect.length && (
          <StyledGroup heading="People">
            {people.entitiesToSelect.map((person) => (
              <CommandMenuItem
                to={`person/${person.id}`}
                label={person.name}
                key={person.id}
                icon={
                  <Avatar
                    avatarUrl={person.avatarUrl}
                    size={theme.icon.size.sm}
                    colorId={person.id}
                    placeholder={person.name}
                  />
                }
              />
            ))}
          </StyledGroup>
        )}
        {!!companies.entitiesToSelect.length && (
          <StyledGroup heading="Companies">
            {companies.entitiesToSelect.map((company) => (
              <CommandMenuItem
                to={`companies/${company.id}`}
                label={company.name}
                key={company.id}
                icon={
                  <Avatar
                    avatarUrl={company.avatarUrl}
                    size={theme.icon.size.sm}
                    colorId={company.id}
                    placeholder={company.name}
                  />
                }
              />
            ))}
          </StyledGroup>
        )}
        <StyledGroup heading="Navigate">
          <CommandMenuItem
            to="/people"
            label="Go to People"
            shortcuts={['G', 'P']}
          />
          <CommandMenuItem
            to="/companies"
            label="Go to Companies"
            shortcuts={['G', 'C']}
          />
          <CommandMenuItem
            to="/opportunities"
            label="Go to Opportunities"
            shortcuts={['G', 'O']}
          />
          <CommandMenuItem
            to="/settings/profile"
            label="Go to Settings"
            shortcuts={['G', 'S']}
          />
        </StyledGroup>
      </StyledList>
    </StyledDialog>
  );
}
