import { CommandMenuNavigationItemActions } from '@/command-menu/pages/navigation-menu-item/command-menu-navigation-item-actions';

const ORGANIZE_ACTIONS_WITHOUT_MOVE_TO_FOLDER: CommandMenuNavigationItemActions[] =
  [
    CommandMenuNavigationItemActions.MOVE_UP,
    CommandMenuNavigationItemActions.MOVE_DOWN,
    CommandMenuNavigationItemActions.ADD_BEFORE,
    CommandMenuNavigationItemActions.ADD_AFTER,
    CommandMenuNavigationItemActions.REMOVE,
  ];

const ORGANIZE_ACTIONS_WITH_MOVE_TO_FOLDER: CommandMenuNavigationItemActions[] =
  [
    CommandMenuNavigationItemActions.MOVE_UP,
    CommandMenuNavigationItemActions.MOVE_DOWN,
    CommandMenuNavigationItemActions.MOVE_TO_FOLDER,
    CommandMenuNavigationItemActions.ADD_BEFORE,
    CommandMenuNavigationItemActions.ADD_AFTER,
    CommandMenuNavigationItemActions.REMOVE,
  ];

export const getOrganizeActionsSelectableItemIds = (
  includeMoveToFolder: boolean,
): CommandMenuNavigationItemActions[] =>
  includeMoveToFolder
    ? ORGANIZE_ACTIONS_WITH_MOVE_TO_FOLDER
    : ORGANIZE_ACTIONS_WITHOUT_MOVE_TO_FOLDER;
