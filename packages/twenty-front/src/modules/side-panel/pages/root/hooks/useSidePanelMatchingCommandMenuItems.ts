import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { useSidePanelCommandMenuItems } from '@/side-panel/pages/root/hooks/useSidePanelCommandMenuItems';

export const useSidePanelMatchingCommandMenuItems = ({
  sidePanelSearch,
}: {
  sidePanelSearch: string;
}) => {
  const { filterCommandMenuItemsWithSidePanelSearch } =
    useFilterCommandMenuItemsWithSidePanelSearch({
      sidePanelSearch: sidePanelSearch,
    });

  const {
    navigationCommandMenuItems,
    recordSelectionCommandMenuItems,
    objectCommandMenuItems,
    globalCommandMenuItems,
    workflowRunRecordSelectionCommandMenuItems,
    workflowRunGlobalCommandMenuItems,
    frontComponentGlobalCommandMenuItems,
    frontComponentRecordSelectionCommandMenuItems,
    fallbackCommandMenuItems,
    createRelatedRecordCommandMenuItems,
  } = useSidePanelCommandMenuItems();

  const matchingNavigationCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(navigationCommandMenuItems);

  const matchingRecordSelectionCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(recordSelectionCommandMenuItems);

  const matchingObjectCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(objectCommandMenuItems);

  const matchingGlobalCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(globalCommandMenuItems);

  const matchingWorkflowRunRecordSelectionCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(
      workflowRunRecordSelectionCommandMenuItems,
    );

  const matchingWorkflowRunGlobalCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(
      workflowRunGlobalCommandMenuItems,
    );

  const matchingFrontComponentGlobalCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(
      frontComponentGlobalCommandMenuItems,
    );

  const matchingFrontComponentRecordSelectionCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(
      frontComponentRecordSelectionCommandMenuItems,
    );

  const matchingCreateRelatedRecordCommandMenuItems =
    filterCommandMenuItemsWithSidePanelSearch(
      createRelatedRecordCommandMenuItems,
    );

  const noResults =
    !matchingRecordSelectionCommandMenuItems.length &&
    !matchingWorkflowRunRecordSelectionCommandMenuItems.length &&
    !matchingFrontComponentRecordSelectionCommandMenuItems.length &&
    !matchingGlobalCommandMenuItems.length &&
    !matchingWorkflowRunGlobalCommandMenuItems.length &&
    !matchingFrontComponentGlobalCommandMenuItems.length &&
    !matchingObjectCommandMenuItems.length &&
    !matchingNavigationCommandMenuItems.length &&
    !matchingCreateRelatedRecordCommandMenuItems.length;

  return {
    noResults,
    matchingRecordSelectionCommandMenuItems,
    matchingObjectCommandMenuItems,
    matchingWorkflowRunRecordSelectionCommandMenuItems,
    matchingFrontComponentRecordSelectionCommandMenuItems,
    matchingGlobalCommandMenuItems,
    matchingWorkflowRunGlobalCommandMenuItems,
    matchingFrontComponentGlobalCommandMenuItems,
    matchingNavigationCommandMenuItems,
    matchingCreateRelatedRecordCommandMenuItems,
    fallbackCommandMenuItems: noResults ? fallbackCommandMenuItems : [],
  };
};
