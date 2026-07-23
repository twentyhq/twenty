import { PageLayoutTabWidgetDropTarget } from '@/page-layout/components/dnd/PageLayoutTabWidgetDropTarget';
import { PAGE_LAYOUT_TAB_DND_TYPE } from '@/page-layout/constants/PageLayoutTabDndType';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTabDragData } from '@/page-layout/types/PageLayoutWidgetDndData';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  group: string;
  isActive: boolean;
  disabled?: boolean;
  isWidgetDropTarget?: boolean;
  dropLineOrientation?: 'horizontal' | 'vertical';
  onSelect: () => void;
};

const StyledTabContentWrapper = styled.div<{ isBeingEdited: boolean }>`
  border-radius: ${themeCssVariables.border.radius.sm};
  outline: ${({ isBeingEdited }) =>
    isBeingEdited ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
  outline-offset: -1px;
`;

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  group,
  isActive,
  disabled,
  isWidgetDropTarget = false,
  dropLineOrientation = 'vertical',
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );

  const isSettingsOpenForThisTab = pageLayoutTabSettingsOpenTabId === tab.id;

  const tabDragData: PageLayoutTabDragData = {
    type: 'tab',
    tabId: tab.id,
  };

  const draggableTab = (
    <DragDropItemSortableCell
      id={tab.id}
      index={index}
      group={group}
      data={tabDragData}
      type={PAGE_LAYOUT_TAB_DND_TYPE}
      accept={PAGE_LAYOUT_TAB_DND_TYPE}
      disabled={disabled}
      hasTransition={false}
      dropLine={dropLineOrientation}
    >
      <StyledTabContainer
        onClick={onSelect}
        active={isActive}
        disabled={disabled}
      >
        <StyledTabContentWrapper isBeingEdited={isSettingsOpenForThisTab}>
          <TabContent
            id={tab.id}
            active={isActive}
            disabled={disabled}
            LeftIcon={tab.Icon}
            title={tab.title}
            logo={tab.logo}
            pill={tab.pill}
          />
        </StyledTabContentWrapper>
      </StyledTabContainer>
    </DragDropItemSortableCell>
  );

  if (!isWidgetDropTarget) {
    return draggableTab;
  }

  return (
    <PageLayoutTabWidgetDropTarget tabId={tab.id}>
      {draggableTab}
    </PageLayoutTabWidgetDropTarget>
  );
};
