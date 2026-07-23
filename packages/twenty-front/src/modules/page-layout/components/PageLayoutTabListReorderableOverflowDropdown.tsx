import { pointerIntersection } from '@dnd-kit/collision';
import { useDroppable } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListDroppableMoreButton } from '@/page-layout/components/PageLayoutTabListDroppableMoreButton';
import { PageLayoutTabMenuItemSelectAvatar } from '@/page-layout/components/PageLayoutTabMenuItemSelectAvatar';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import {
  type PageLayoutTabDragData,
  type PageLayoutTabListEndDropData,
} from '@/page-layout/types/PageLayoutWidgetDndData';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { DragDropItemDropLine } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropLine';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type PageLayoutType } from '~/generated-metadata/graphql';

const StyledOverflowMenuItemWrapper = styled.div`
  cursor: grab;
  display: flex;
  min-width: 100%;

  &:active {
    cursor: grabbing;
  }
`;

const StyledOverflowEndDropZone = styled.div`
  min-height: ${themeCssVariables.spacing[2]};
  position: relative;
`;

const PageLayoutTabListOverflowEndDropZone = () => {
  const endDropData: PageLayoutTabListEndDropData = {
    type: 'tab-list-end',
    beforeTabId: null,
  };

  const { ref, isDropTarget } = useDroppable({
    id: `${PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}-end`,
    accept: PAGE_LAYOUT_TAB_DND_TYPE,
    collisionDetector: pointerIntersection,
    data: endDropData,
  });

  return (
    <StyledOverflowEndDropZone ref={ref}>
      {isDropTarget && <DragDropItemDropLine />}
    </StyledOverflowEndDropZone>
  );
};

type PageLayoutTabListReorderableOverflowDropdownProps = {
  dropdownId: string;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  visibleTabCount: number;
  onClose: () => void;
  pageLayoutType: PageLayoutType;
};

export const PageLayoutTabListReorderableOverflowDropdown = ({
  dropdownId,
  hiddenTabs,
  hiddenTabsCount,
  isActiveTabHidden,
  activeTabId,
  loading,
  onSelect,
  visibleTabCount,
  onClose,
  pageLayoutType,
}: PageLayoutTabListReorderableOverflowDropdownProps) => {
  const context = useContext(TabListComponentInstanceContext);
  const instanceId = context?.instanceId;

  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const shouldShowEditButton =
    isPageLayoutInEditMode && shouldEnableTabEditingFeatures(pageLayoutType);

  const isPageLayoutTabDragging = useAtomComponentStateValue(
    isPageLayoutTabDraggingComponentState,
    instanceId,
  );

  const setIsPageLayoutTabDragging = useSetAtomComponentState(
    isPageLayoutTabDraggingComponentState,
    instanceId,
  );

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const handleClose = () => {
    if (!isPageLayoutTabDragging) {
      onClose();
    }
  };

  const handleTabSelect = (tabId: string) => {
    setIsPageLayoutTabDragging(false);
    onSelect(tabId);
    handleClose();
  };

  const handleEditClick = (tabId: string) => {
    setPageLayoutTabSettingsOpenTabId(tabId);
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutTabSettings,
    });
    onClose();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClickOutside={handleClose}
      clickableComponent={
        <PageLayoutTabListDroppableMoreButton
          hiddenTabsCount={hiddenTabsCount}
          isActiveTabHidden={isActiveTabHidden}
          data-dropdown-id={dropdownId}
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <DropdownMenuItemsContainer>
            {hiddenTabs.map((tab, index) => {
              const disabled = tab.disabled ?? loading;
              const tabDragData: PageLayoutTabDragData = {
                type: 'tab',
                tabId: tab.id,
              };

              return (
                <DragDropItemSortableCell
                  key={tab.id}
                  id={tab.id}
                  index={visibleTabCount + index}
                  group={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
                  data={tabDragData}
                  type={PAGE_LAYOUT_TAB_DND_TYPE}
                  accept={PAGE_LAYOUT_TAB_DND_TYPE}
                  disabled={disabled}
                  hasTransition={false}
                  dropLine="horizontal"
                >
                  <StyledOverflowMenuItemWrapper>
                    <PageLayoutTabMenuItemSelectAvatar
                      tab={tab}
                      selected={tab.id === activeTabId}
                      onClick={() => handleTabSelect(tab.id)}
                      disabled={disabled}
                      showEditButton={shouldShowEditButton}
                      onEditClick={handleEditClick}
                    />
                  </StyledOverflowMenuItemWrapper>
                </DragDropItemSortableCell>
              );
            })}
            <PageLayoutTabListOverflowEndDropZone />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
