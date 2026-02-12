import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_FRAGMENT } from '@/navigation-menu-item/graphql/fragments/navigationMenuItemFragment';

export const DELETE_NAVIGATION_MENU_ITEM = gql`
  ${NAVIGATION_MENU_ITEM_FRAGMENT}
  mutation DeleteNavigationMenuItem($id: UUID!) {
    deleteNavigationMenuItem(id: $id) {
      ...NavigationMenuItemFields
    }
  }
`;
