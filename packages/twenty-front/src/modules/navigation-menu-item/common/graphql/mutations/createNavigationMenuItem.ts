import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_QUERY_FRAGMENT } from '@/navigation-menu-item/common/graphql/fragments/navigationMenuItemQueryFragment';

export const CREATE_NAVIGATION_MENU_ITEM = gql`
  ${NAVIGATION_MENU_ITEM_QUERY_FRAGMENT}
  mutation CreateNavigationMenuItem($input: CreateNavigationMenuItemInput!) {
    createNavigationMenuItem(input: $input) {
      ...NavigationMenuItemQueryFields
    }
  }
`;
