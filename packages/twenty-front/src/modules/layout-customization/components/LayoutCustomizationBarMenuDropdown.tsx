import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconReload } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { GRAY_SCALE_LIGHT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID } from '@/layout-customization/constants/LayoutCustomizationBarDropdownId';
import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

const StyledInvertedIconButtonWrapper = styled.span`
  align-items: center;
  display: flex;

  button {
    color: ${GRAY_SCALE_LIGHT.gray1};
  }

  button:hover {
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
    <Dropdown
      dropdownId={LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <StyledInvertedIconButtonWrapper>
          <LightIconButton
            emphasis="subtle"
            aria-label={t`Layout customization menu`}
          >
            <IconDotsVertical />
          </LightIconButton>
        </StyledInvertedIconButtonWrapper>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconReload />}
              onClick={getDropdownMenuItemClickHandler(handleResetClick)}
            >
              <OverflowingTextWithTooltip text={t`Reset record page layout`} />
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
