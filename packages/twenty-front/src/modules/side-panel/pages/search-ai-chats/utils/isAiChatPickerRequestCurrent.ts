import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

export const isAiChatPickerRequestCurrent = ({
  isSidePanelOpened,
  initialPage,
  currentPage,
  initialWorkspaceId,
  currentWorkspaceId,
}: {
  isSidePanelOpened: boolean;
  initialPage: SidePanelNavigationStackItem | undefined;
  currentPage: SidePanelNavigationStackItem | undefined;
  initialWorkspaceId: string | undefined;
  currentWorkspaceId: string | undefined;
}) =>
  isSidePanelOpened &&
  currentPage === initialPage &&
  currentWorkspaceId === initialWorkspaceId;
