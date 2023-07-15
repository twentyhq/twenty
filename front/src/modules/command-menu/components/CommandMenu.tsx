import { useEffect, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useRecoilState } from 'recoil';

import { useFilteredSearchCompanyQuery } from '@/companies/services';
import { usePreviousHotkeyScope } from '@/lib/hotkeys/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/lib/hotkeys/types/AppHotkeyScope';
import { useFilteredSearchPeopleQuery } from '@/people/services';
import { Avatar } from '@/users/components/Avatar';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpened';

import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledList,
} from './CommandMenuStyles';

export function CommandMenu() {
  const [open, setOpen] = useRecoilState(isCommandMenuOpenedState);
  const [search, setSearch] = useState('');

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      handleOpenChange(!open);
    },
    AppHotkeyScope.CommandMenu,
    [setOpen, open, handleOpenChange],
  );

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function handleOpenChange(newOpenState: boolean) {
    if (newOpenState) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
    } else {
      setOpen(false);
      goBackToPreviousHotkeyScope();
    }
  }

  const people = useFilteredSearchPeopleQuery(search, [], 3);
  // const companies = useFilteredSearchCompanyQuery(search);

  /*
  TODO: Allow performing actions on page through CommandBar 

  import { useMatch, useResolvedPath } from 'react-router-dom';
  import { IconBuildingSkyscraper, IconUser } from '@/ui/icons';

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
      open={open}
      onOpenChange={handleOpenChange}
      label="Global Command Menu"
    >
      <StyledInput placeholder="Search" />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>
        {people.entitiesToSelect.length && (
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
