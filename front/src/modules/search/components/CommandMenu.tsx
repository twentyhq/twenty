import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledItem,
  StyledList,
  // StyledSeparator,
} from './CommandMenuStyles';

export const CommandMenu = ({ initiallyOpen = false }) => {
  const [open, setOpen] = React.useState(initiallyOpen);

  useHotkeys(
    'ctrl+k,meta+k',
    () => {
      setOpen((prevOpen) => !prevOpen);
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [setOpen],
  );

  const navigate = useNavigate();

  return (
    <StyledDialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
    >
      <StyledInput />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>

        <StyledGroup heading="Go to">
          <StyledItem
            onSelect={() => {
              setOpen(false);
              navigate('/people');
            }}
          >
            People
          </StyledItem>
          <StyledItem
            onSelect={() => {
              setOpen(false);
              navigate('/companies');
            }}
          >
            Companies
          </StyledItem>
          <StyledItem
            onSelect={() => {
              setOpen(false);
              navigate('/settings/profile');
            }}
          >
            Settings
          </StyledItem>
        </StyledGroup>
      </StyledList>
    </StyledDialog>
  );
};
