import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_QUERY_FRAGMENT } from '@/navigation-menu-item/common/graphql/fragments/navigationMenuItemQueryFragment';

export const CREATE_MANY_NAVIGATION_MENU_ITEMS = gql`
  ${NAVIGATION_MENU_ITEM_QUERY_FRAGMENT}
  mutation CreateManyNavigationMenuItems(
    $inputs: [CreateNavigationMenuItemInput!]!
  ) {
    createManyNavigationMenuItems(inputs: $inputs) {
      ...NavigationMenuItemQueryFields
    }
  }
`;
