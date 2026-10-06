import { styled } from '@linaria/react';

import { PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS } from '@/page-layout/components/PageLayoutTabListDroppableIds';
import { PageLayoutTabListDroppableMoreButton } from '@/page-layout/components/PageLayoutTabListDroppableMoreButton';
import { PageLayoutTabMenuItemSelectAvatar } from '@/page-layout/components/PageLayoutTabMenuItemSelectAvatar';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutTabDraggingComponentState } from '@/page-layout/states/isPageLayoutTabDraggingComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTabDragData } from '@/page-layout/types/PageLayoutTabDragData';
import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Dropdown } from 'twenty-ui/components/navigation';
import { isDefined } from 'twenty-shared/utils';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { Fragment, type RefObject, useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { type PageLayoutType } from '~/generated-metadata/graphql';

const SORTABLE_HANDLE_SELECTOR = '[data-dnd-sortable-handle]';

const StyledOverflowMenuItemWrapper = styled.div`
  cursor: grab;
  display: flex;
  min-width: 100%;

  &:active {
    cursor: grabbing;
  }
`;

type PageLayoutTabListReorderableOverflowDropdownProps = {
  dropdownId: string;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  visibleTabCount: number;
  pageLayoutType: PageLayoutType;
  tabListContainerRef: RefObject<HTMLDivElement | null>;
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
  pageLayoutType,
  tabListContainerRef,
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

  const { closeDropdown } = useCloseDropdown();

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const handleTabSelect = (tabId: string) => {
    if (isPageLayoutTabDragging) {
      return;
    }

    onSelect(tabId);
  };

  const handleEditClick = (tabId: string) => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.PageLayoutTabSettings,
    });
    setPageLayoutTabSettingsOpenTabId(tabId);
    closeDropdown(dropdownId);
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onInteractOutside={(event) => {
        const isTouchSwipe = event.type === 'touchmove';
        const isVisibleTabPress =
          !isTouchSwipe &&
          isDefined(event.target?.closest(SORTABLE_HANDLE_SELECTOR)) &&
          (tabListContainerRef.current?.contains(event.target) ?? false);

        if (isPageLayoutTabDragging || isVisibleTabPress) {
          event.preventDefault();
        }
      }}
      onEscapeKeyDown={(event) => {
        if (isPageLayoutTabDragging) {
          event.preventDefault();
        }
      }}
    >
      <PageLayoutTabListDroppableMoreButton
        hiddenTabsCount={hiddenTabsCount}
        isActiveTabHidden={isActiveTabHidden}
      />
      <DropdownContent align="end" sideOffset={8} width={200}>
        <Dropdown.Section>
          {hiddenTabs.map((tab, index) => {
            const disabled = tab.disabled ?? loading;
            const tabDragData: PageLayoutTabDragData = {
              type: 'tab',
              tabId: tab.id,
              nextTabId: hiddenTabs[index + 1]?.id ?? null,
            };

            return (
              <Fragment key={tab.id}>
                <DragDropItemDropTarget
                  index={visibleTabCount + index}
                  droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
                  orientation="horizontal"
                  compact
                />
                <DragDropItemSortableCell
                  id={tab.id}
                  index={visibleTabCount + index}
                  group={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
                  data={tabDragData}
                  type={PAGE_LAYOUT_TAB_DND_TYPE}
                  accept={PAGE_LAYOUT_TAB_DND_TYPE}
                  disabled={disabled}
                  hasTransition={false}
                  orientation="horizontal"
                >
                  <StyledOverflowMenuItemWrapper>
                    <PageLayoutTabMenuItemSelectAvatar
                      tab={tab}
                      selected={tab.id === activeTabId}
                      onSelect={() => handleTabSelect(tab.id)}
                      closeOnSelect={!isPageLayoutTabDragging}
                      disabled={disabled}
                      showEditButton={shouldShowEditButton}
                      onEditClick={handleEditClick}
                    />
                  </StyledOverflowMenuItemWrapper>
                </DragDropItemSortableCell>
              </Fragment>
            );
          })}
          <DragDropItemDropTarget
            index={visibleTabCount + hiddenTabs.length}
            droppableId={PAGE_LAYOUT_TAB_LIST_DROPPABLE_IDS.OVERFLOW_TABS}
            orientation="horizontal"
            compact
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
