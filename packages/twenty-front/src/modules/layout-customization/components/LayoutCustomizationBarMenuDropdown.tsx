import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconReload } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { GRAY_SCALE_LIGHT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID } from '@/layout-customization/constants/LayoutCustomizationBarDropdownId';
import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { Menu } from 'twenty-ui/primitives/surfaces';

const StyledInvertedIconButton = styled.button`
  align-items: center;
  color: ${GRAY_SCALE_LIGHT.gray1};

  display: flex;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

export const LayoutCustomizationBarMenuDropdown = () => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { openDialog } = useDialog();

  const handleResetClick = () => {
    closeDropdown(LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID);
    openDialog(RESET_RECORD_PAGE_LAYOUT_MODAL_ID);
  };

  return (
    <DropdownMenu
      dropdownId={LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <LightIconButton
          render={<StyledInvertedIconButton />}
          emphasis="subtle"
          aria-label={t`Layout customization menu`}
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
          <Menu.Group>
            <Menu.Item
              startIcon={<IconReload />}
              onClick={handleResetClick}
            >{t`Reset record page layout`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
    />
  );
};
