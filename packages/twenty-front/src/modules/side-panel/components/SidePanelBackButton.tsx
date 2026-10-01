import { SIDE_PANEL_NAVIGATION_HISTORY_DROPDOWN_ID } from '@/side-panel/constants/SidePanelNavigationHistoryDropdownId';
import { useSidePanelContextChips } from '@/side-panel/hooks/useSidePanelContextChips';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { t } from '@lingui/core/macro';
import { Children, useRef, type MouseEvent } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconChevronLeft } from 'twenty-ui/icon';

export const SidePanelBackButton = () => {
  const { goBackFromSidePanel } = useSidePanelHistory();

  const { contextChips } = useSidePanelContextChips();

  const { openDropdown } = useOpenDropdown();

  const backButtonRef = useRef<HTMLButtonElement>(null);

  const handleBackButtonContextMenu = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isNonEmptyArray(contextChips)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    openDropdown({
      dropdownComponentInstanceIdFromProps:
        SIDE_PANEL_NAVIGATION_HISTORY_DROPDOWN_ID,
    });
  };

  return (
    <DropdownRoot
      type="menu"
      dropdownId={SIDE_PANEL_NAVIGATION_HISTORY_DROPDOWN_ID}
      onInteractOutside={(event) => {
        if (backButtonRef.current?.contains(event.target)) {
          event.preventDefault();
        }
      }}
    >
      <IconButton
        ref={backButtonRef}
        size="sm"
        variant="ghost"
        onClick={goBackFromSidePanel}
        onContextMenu={handleBackButtonContextMenu}
        aria-label={t`Back`}
      >
        <IconChevronLeft />
      </IconButton>
      <DropdownContent
        anchor={backButtonRef}
        finalFocus={backButtonRef}
        aria-label={t`Navigation history`}
      >
        <Dropdown.Section>
          {contextChips.slice(0, -1).map((chip, index) => (
            <Dropdown.ActionItem
              key={index}
              startIcon={<>{Children.toArray(chip.Icons)}</>}
              onClick={chip.onClick}
            >
              {chip.text}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
