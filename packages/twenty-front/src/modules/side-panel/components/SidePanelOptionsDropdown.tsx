import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG } from '@/ui/layout/dropdown/constants/OptionsDropdownGlobalHotkeysConfig';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';

type SidePanelOptionsDropdownProps = {
  dropdownId: string;
  children: ReactNode;
};

export const SidePanelOptionsDropdown = ({
  dropdownId,
  children,
}: SidePanelOptionsDropdownProps) => {
  const { t } = useLingui();

  useSidePanelOptionsHotkeys(dropdownId);

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="menu"
      globalHotkeysConfig={OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG}
    >
      <Dropdown.Trigger
        render={
          <IconButton aria-label={t`Options`} size="sm" variant="outline">
            <IconDotsVertical />
          </IconButton>
        }
      />
      <DropdownRootContent
        side="top"
        align="end"
        sideOffset={DROPDOWN_OFFSET_Y}
      >
        <Dropdown.Section>{children}</Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
