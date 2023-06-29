import React from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';
import { IconBuildingSkyscraper, IconUser } from '@/ui/icons';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpened';
import { queuedActionsState } from '../states/queuedAction';

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
  const navigate = useNavigate();
  const [open, setOpen] = useRecoilState(isCommandMenuOpenedState);
  const [, setQueuedActions] = useRecoilState(queuedActionsState);

  useDirectHotkeys(
    'ctrl+k,meta+k',
    (event) => {
      event.preventDefault();
      setOpen((prevOpen) => !prevOpen);
    },
    [setOpen],
  );

  const queueActionAndNavigate = (action: string, path: string) => {
    setQueuedActions((oldQueue) => [...oldQueue, action]);
    navigate(path);
  };

  const createSection = (
    <StyledGroup heading="Create">
      <CommandMenuItem
        label="Create People"
        onClick={() =>
          queueActionAndNavigate('people/create_people', '/people')
        }
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
        onClick={() =>
          queueActionAndNavigate('companies/create_company', '/companies')
        }
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
  );

  return (
    <StyledDialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
    >
      <StyledInput placeholder="Search" />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>
        {createSection}
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
