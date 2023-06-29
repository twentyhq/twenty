import React from 'react';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { useDirectHotkeys } from '@/hotkeys/hooks/useDirectHotkeys';
import { IconBuildingSkyscraper, IconUser } from '@/ui/icons';

import { isCommandMenuOpenedState } from '../states/isCommandMenuOpened';
import { queuedActionsState } from '../states/queuedActionsState';
import { QueuedActions } from '../types/QueuedActions';

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

  const queueActionAndNavigate = (action: QueuedActions, path: string) => {
    setQueuedActions((oldQueue) => [...oldQueue, { id: uuidv4(), action }]);
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
