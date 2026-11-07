import { LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID } from '@/layout-customization/constants/LayoutCustomizationBarDropdownId';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconReload } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

export const LayoutCustomizationBarMenuDropdown = () => {
  const { t } = useLingui();
  const { openDialog } = useDialog();

  const handleResetClick = () => {
    openDialog(RESET_RECORD_PAGE_LAYOUT_MODAL_ID);
  };

  return (
    <DropdownRoot dropdownId={LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID} type="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton
            emphasis="subtle"
            color="inherit"
            aria-label={t`Layout customization menu`}
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent width={GenericDropdownContentWidth.Large}>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconReload />}
            onClick={handleResetClick}
          >
            {t`Reset record page layout`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
