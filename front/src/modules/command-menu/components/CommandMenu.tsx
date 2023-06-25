import React from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';
import { IconBuildingSkyscraper, IconUser } from '@/ui/icons';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpened';

import { CommandMenuItem } from './CommandMenuItem';
import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledList,
  // StyledSeparator,
} from './CommandMenuStyles';

export function CommandMenu({ initiallyOpen = false }) {
  const [open, setOpen] = useRecoilState(isCommandMenuOpenedState);

  useDirectHotkeys(
    'ctrl+k,meta+k',
    () => {
      setOpen((prevOpen) => !prevOpen);
    },
    [setOpen],
  );

  const createPeople = () => null;
  const createCompany = () => null;

  return (
    <StyledDialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
    >
      <StyledInput />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>

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

        <StyledGroup heading="Go to">
          <CommandMenuItem to="/people" label="People" shortcuts={['G', 'P']} />
          <CommandMenuItem
            to="/companies"
            label="Companies"
            shortcuts={['G', 'C']}
          />
          <CommandMenuItem
            to="/opportunities"
            label="Opportunities"
            shortcuts={['G', 'O']}
          />
          <CommandMenuItem
            to="/settings/profile"
            label="Settings"
            shortcuts={['G', 'S']}
          />
        </StyledGroup>
      </StyledList>
    </StyledDialog>
  );
}
