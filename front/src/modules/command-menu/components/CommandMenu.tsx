import React from 'react';
import { useRecoilState } from 'recoil';

import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';

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

export function CommandMenu() {
  const [open, setOpen] = useRecoilState(isCommandMenuOpenedState);

  useDirectHotkeys(
    'ctrl+k,meta+k',
    () => {
      setOpen((prevOpen) => !prevOpen);
    },
    [setOpen],
  );

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

  return (
    <StyledDialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
    >
      <StyledInput placeholder="Search" />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>
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
