import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_FRAGMENT } from '@/navigation-menu-item/graphql/fragments/navigationMenuItemFragment';

export const FIND_ONE_NAVIGATION_MENU_ITEM = gql`
  ${NAVIGATION_MENU_ITEM_FRAGMENT}
  query FindOneNavigationMenuItem($id: UUID!) {
    navigationMenuItem(id: $id) {
      ...NavigationMenuItemFields
    }
  }
`;
