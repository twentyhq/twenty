import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { type DropdownMenuProps } from '@/ui/layout/dropdown/types/DropdownMenuProps';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { Menu } from 'twenty-ui/primitives/surfaces';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, type ReactElement, useId } from 'react';
import { IconDotsVertical } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';

type OptionsDropdownMenuProps = {
  dropdownId?: string;
  clickableComponent?: ReactElement;
  dropdownPlacement?: DropdownMenuProps['dropdownPlacement'];
  dropdownOffset?: DropdownMenuProps['dropdownOffset'];
  shouldRegisterOptionsHotkey?: boolean;
  onOpen?: () => void;
  children: ReactNode;
};

const DEFAULT_OPTIONS_DROPDOWN_OFFSET = { y: 8 };

const OptionsDropdownMenuHotkeyEffect = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { toggleDropdown } = useToggleDropdown();

  const hotkeysConfig = {
    keys: ['ctrl+o', 'meta+o'],
    callback: () => {
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: dropdownId,
      });
    },
    dependencies: [toggleDropdown, dropdownId],
  };

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: SIDE_PANEL_FOCUS_ID,
  });

  useHotkeysOnFocusedElement({
    ...hotkeysConfig,
    focusId: dropdownId,
  });

  return null;
};

export const OptionsDropdownMenu = ({
  dropdownId: dropdownIdFromProps,
  clickableComponent,
  dropdownPlacement = 'top-end',
  dropdownOffset = DEFAULT_OPTIONS_DROPDOWN_OFFSET,
  shouldRegisterOptionsHotkey = true,
  onOpen,
  children,
}: OptionsDropdownMenuProps) => {
  const generatedDropdownId = useId();
  const dropdownId = dropdownIdFromProps ?? generatedDropdownId;
  const { t } = useLingui();

  return (
    <>
      {shouldRegisterOptionsHotkey ? (
        <OptionsDropdownMenuHotkeyEffect dropdownId={dropdownId} />
      ) : null}
      <DropdownMenu
        dropdownId={dropdownId}
        data-select-disable
        clickableComponent={
          clickableComponent ?? (
            <IconButton aria-label={t`Options`} size="sm" variant="outline">
              <IconDotsVertical />
            </IconButton>
          )
        }
        dropdownPlacement={dropdownPlacement}
        dropdownOffset={dropdownOffset}
        globalHotkeysConfig={{
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        }}
        onOpen={onOpen}
        dropdownComponents={
          <DropdownContent>
            <Menu.Group>{children}</Menu.Group>
          </DropdownContent>
        }
      />
    </>
  );
};
