import { gql } from '@apollo/client';
import { NAVIGATION_MENU_ITEM_QUERY_FRAGMENT } from '@/navigation-menu-item/common/graphql/fragments/navigationMenuItemQueryFragment';

export const DELETE_MANY_NAVIGATION_MENU_ITEMS = gql`
  ${NAVIGATION_MENU_ITEM_QUERY_FRAGMENT}
  mutation DeleteManyNavigationMenuItems($ids: [UUID!]!) {
    deleteManyNavigationMenuItems(ids: $ids) {
      ...NavigationMenuItemQueryFields
    }
  }
`;
