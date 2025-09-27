import { TAB_LIST_GAP } from '@/ui/layout/tab-list/constants/TabListGap';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { NodeDimension } from '@/ui/utilities/dimensions/components/NodeDimension';
import styled from '@emotion/styled';
import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { TabListDropdown } from './TabListDropdown';
import { TabListVisibleTabsArea } from './TabListVisibleTabsArea';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  position: relative;
  user-select: none;
  width: 100%;

  &::after {
    background-color: ${({ theme }) => theme.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

const StyledAddButton = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.spacing(10)};
  margin-left: ${TAB_LIST_GAP}px;
`;

type TabListContentProps = {
  visibleTabs: SingleTabProps[];
  visibleTabCount: number;
  activeTabId: string | null;
  loading?: boolean;
  isDraggable?: boolean;
  behaveAsLinks: boolean;
  className?: string;
  componentInstanceId: string;
  onAddTab?: () => void;
  onTabSelect: (tabId: string) => void;
  onTabSelectFromDropdown: (tabId: string) => void;
  onContainerWidthChange: (dimensions: {
    width: number;
    height: number;
  }) => void;
  onDragEnd?: OnDragEndResponder;
};

export const TabListContent = ({
  visibleTabs,
  visibleTabCount,
  activeTabId,
  loading,
  isDraggable,
  behaveAsLinks,
  className,
  componentInstanceId,
  onAddTab,
  onTabSelect,
  onTabSelectFromDropdown,
  onContainerWidthChange,
  onDragEnd,
}: TabListContentProps) => {
  const hiddenTabsCount = visibleTabs.length - visibleTabCount;
  const hasHiddenTabs = hiddenTabsCount > 0;

  const isActiveTabHidden =
    hasHiddenTabs &&
    visibleTabs.slice(visibleTabCount).some((tab) => tab.id === activeTabId);

  const dropdownId = `tab-overflow-${componentInstanceId}`;

  const content = (
    <NodeDimension onDimensionChange={onContainerWidthChange}>
      <StyledContainer className={className}>
        <TabListVisibleTabsArea
          visibleTabs={visibleTabs}
          visibleTabCount={visibleTabCount}
          activeTabId={activeTabId}
          loading={loading}
          isDraggable={isDraggable}
          behaveAsLinks={behaveAsLinks}
          onTabSelect={onTabSelect}
        />

        {hasHiddenTabs && (
          <TabListDropdown
            dropdownId={dropdownId}
            onClose={() => {}}
            overflow={{
              hiddenTabsCount,
              isActiveTabHidden,
            }}
            hiddenTabs={visibleTabs.slice(visibleTabCount)}
            activeTabId={activeTabId || ''}
            onTabSelect={onTabSelectFromDropdown}
            loading={loading}
            isDraggable={isDraggable}
            visibleTabCount={visibleTabCount}
          />
        )}

        {onAddTab && (
          <StyledAddButton>
            <IconButton
              Icon={IconPlus}
              size="small"
              variant="tertiary"
              onClick={() => onAddTab()}
            />
          </StyledAddButton>
        )}
      </StyledContainer>
    </NodeDimension>
  );

  if (isDraggable === true && onDragEnd !== undefined) {
    return <DragDropContext onDragEnd={onDragEnd}>{content}</DragDropContext>;
  }

  return content;
};
