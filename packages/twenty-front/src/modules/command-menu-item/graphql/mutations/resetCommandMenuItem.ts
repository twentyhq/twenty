import { COMMAND_MENU_ITEM_FRAGMENT } from '@/command-menu-item/graphql/fragments/commandMenuItemFragment';
import { gql } from '@apollo/client';

export const RESET_COMMAND_MENU_ITEM = gql`
  ${COMMAND_MENU_ITEM_FRAGMENT}
  mutation ResetCommandMenuItem($id: UUID!) {
    resetCommandMenuItem(id: $id) {
      ...CommandMenuItemFields
    }
  }
`;
