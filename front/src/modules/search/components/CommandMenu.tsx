import React from 'react';
import { Command } from 'cmdk';

import {
  StyledDialog,
  StyledEmpty,
  StyledGroup,
  StyledInput,
  StyledItem,
  StyledList,
} from './CommandMenuStyles';

export const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);

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

  return (
    <StyledDialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
    >
      <StyledInput />
      <StyledList>
        <StyledEmpty>No results found.</StyledEmpty>

        <StyledGroup heading="Letters">
          <StyledItem>a</StyledItem>
          <StyledItem>b</StyledItem>
          <Command.Separator />
          <StyledItem>c</StyledItem>
        </StyledGroup>

        <StyledItem>Apple</StyledItem>
      </StyledList>
    </StyledDialog>
  );
};
