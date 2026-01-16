import { gql } from '@apollo/client';

import { COMMAND_MENU_ITEM_FRAGMENT } from '@/command-menu-item/graphql/fragments/commandMenuItemFragment';

export const FIND_MANY_COMMAND_MENU_ITEMS = gql`
  ${COMMAND_MENU_ITEM_FRAGMENT}
  query FindManyCommandMenuItems {
    commandMenuItems {
      ...CommandMenuItemFields
    }
  }
`;
