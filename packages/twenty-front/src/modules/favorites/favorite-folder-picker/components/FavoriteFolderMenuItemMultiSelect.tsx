import styled from '@emotion/styled';
import { MenuItemMultiSelect } from '@ui/navigation/menu-item/components/MenuItemMultiSelect';

const StyledNoGapMenuItem = styled(MenuItemMultiSelect)`
  & > div {
    gap: 0;
  }
`;

export const FavoriteFolderMenuItemMultiSelect = StyledNoGapMenuItem;
