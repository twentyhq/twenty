import { SidePanelNavigationItemActions } from '@/command-menu/pages/navigation-menu-item/command-menu-navigation-item-actions';

const ORGANIZE_ACTIONS_WITHOUT_MOVE_TO_FOLDER: SidePanelNavigationItemActions[] =
  [
    SidePanelNavigationItemActions.MOVE_UP,
    SidePanelNavigationItemActions.MOVE_DOWN,
    SidePanelNavigationItemActions.ADD_BEFORE,
    SidePanelNavigationItemActions.ADD_AFTER,
    SidePanelNavigationItemActions.REMOVE,
  ];

const ORGANIZE_ACTIONS_WITH_MOVE_TO_FOLDER: SidePanelNavigationItemActions[] =
  [
    SidePanelNavigationItemActions.MOVE_UP,
    SidePanelNavigationItemActions.MOVE_DOWN,
    SidePanelNavigationItemActions.MOVE_TO_FOLDER,
    SidePanelNavigationItemActions.ADD_BEFORE,
    SidePanelNavigationItemActions.ADD_AFTER,
    SidePanelNavigationItemActions.REMOVE,
  ];

export const getOrganizeActionsSelectableItemIds = (
  includeMoveToFolder: boolean,
): SidePanelNavigationItemActions[] =>
  includeMoveToFolder
    ? ORGANIZE_ACTIONS_WITH_MOVE_TO_FOLDER
    : ORGANIZE_ACTIONS_WITHOUT_MOVE_TO_FOLDER;
