import { useRecoilState } from 'recoil';

import { usePreviousHotkeysScope } from '@/lib/hotkeys/hooks/usePreviousHotkeysScope';
import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/lib/hotkeys/types/AppHotkeyScope';

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

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      handleOpenChange(!open);
    },
    AppHotkeyScope.CommandMenu,
    [setOpen, open, handleOpenChange],
  );

  const {
    setHotkeysScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeysScope,
  } = usePreviousHotkeysScope();

  function handleOpenChange(newOpenState: boolean) {
    if (newOpenState) {
      setOpen(true);
      setHotkeysScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
    } else {
      setOpen(false);
      goBackToPreviousHotkeysScope();
    }
  }

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
      onOpenChange={handleOpenChange}
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
