import React from 'react';
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

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

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
        </StyledGroup>
      </StyledList>
    </StyledDialog>
  );
};
