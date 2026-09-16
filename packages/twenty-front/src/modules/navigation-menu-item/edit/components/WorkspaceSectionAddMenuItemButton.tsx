import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const StyledContainer = styled.div`
  padding-top: ${themeCssVariables.spacing['0.5']};
`;

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  return (
    <NavigationMenuItemEntrance>
      <StyledContainer>
        <NavigationMenuItemAddDropdown>
          <NavigationDrawerItem
            Icon={IconPlus}
            label={t`Add menu item`}
            triggerEvent="CLICK"
            variant="tertiary"
          />
        </NavigationMenuItemAddDropdown>
      </StyledContainer>
    </NavigationMenuItemEntrance>
  );
};
