import { LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID } from '@/layout-customization/constants/LayoutCustomizationBarDropdownId';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconDotsVertical, IconReload } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { GRAY_SCALE_LIGHT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RESET_RECORD_PAGE_LAYOUT_MODAL_ID } from '@/layout-customization/constants/ResetRecordPageLayoutModalId';
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
  const { openDialog } = useDialog();

  const handleResetClick = () => {
    openDialog(RESET_RECORD_PAGE_LAYOUT_MODAL_ID);
  };

  return (
    <DropdownRoot dropdownId={LAYOUT_CUSTOMIZATION_BAR_DROPDOWN_ID} type="menu">
      <StyledInvertedIconButtonWrapper>
        <Dropdown.Trigger
          render={
            <LightIconButton
              emphasis="subtle"
              aria-label={t`Layout customization menu`}
            >
              <IconDotsVertical />
            </LightIconButton>
          }
        />
      </StyledInvertedIconButtonWrapper>
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
