import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_FRAGMENT } from '@/navigation-menu-item/graphql/fragments/navigationMenuItemFragment';

export const UPDATE_NAVIGATION_MENU_ITEM = gql`
  ${NAVIGATION_MENU_ITEM_FRAGMENT}
  mutation UpdateNavigationMenuItem($input: UpdateOneNavigationMenuItemInput!) {
    updateNavigationMenuItem(input: $input) {
      ...NavigationMenuItemFields
    }
  }
`;
