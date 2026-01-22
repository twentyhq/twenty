import { NAVIGATION_MENU_ITEM_QUERY_FRAGMENT } from '@/navigation-menu-item/graphql/fragments/navigationMenuItemQueryFragment';
import { gql } from '@apollo/client';

export const FIND_ONE_NAVIGATION_MENU_ITEM = gql`
  ${NAVIGATION_MENU_ITEM_QUERY_FRAGMENT}
  query FindOneNavigationMenuItem($id: UUID!) {
    navigationMenuItem(id: $id) {
      ...NavigationMenuItemQueryFields
    }
  }
`;
