import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

export const isAiChatPickerRequestCurrent = ({
  isRequestAborted,
  isSidePanelOpened,
  initialPage,
  currentPage,
  initialWorkspaceId,
  currentWorkspaceId,
}: {
  isRequestAborted: boolean;
  isSidePanelOpened: boolean;
  initialPage: SidePanelNavigationStackItem | undefined;
  currentPage: SidePanelNavigationStackItem | undefined;
  initialWorkspaceId: string | undefined;
  currentWorkspaceId: string | undefined;
}) =>
  !isRequestAborted &&
  isSidePanelOpened &&
  currentPage === initialPage &&
  currentWorkspaceId === initialWorkspaceId;
