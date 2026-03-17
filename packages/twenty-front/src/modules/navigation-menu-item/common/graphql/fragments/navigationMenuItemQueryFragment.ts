import { gql } from '@apollo/client';

import { NAVIGATION_MENU_ITEM_FRAGMENT } from './navigationMenuItemFragment';

export const NAVIGATION_MENU_ITEM_QUERY_FRAGMENT = gql`
  ${NAVIGATION_MENU_ITEM_FRAGMENT}
  fragment NavigationMenuItemQueryFields on NavigationMenuItem {
    ...NavigationMenuItemFields
    targetRecordIdentifier {
      id
      labelIdentifier
      imageIdentifier
    }
  }
`;
