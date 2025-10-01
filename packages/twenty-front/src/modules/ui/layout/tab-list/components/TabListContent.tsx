import { DragDropContext, type OnDragEndResponder } from '@hello-pangea/dnd';
import {
  TabListContentBody,
  type TabListContentBodyProps,
} from './TabListContentBody';

type TabListContentProps = Omit<TabListContentBodyProps, 'isDraggable'> & {
  isDraggable?: boolean;
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
  const isDragAndDropEnabled = isDraggable === true && onDragEnd !== undefined;

  if (isDragAndDropEnabled) {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <TabListContentBody
          visibleTabs={visibleTabs}
          visibleTabCount={visibleTabCount}
          activeTabId={activeTabId}
          loading={loading}
          behaveAsLinks={behaveAsLinks}
          className={className}
          componentInstanceId={componentInstanceId}
          onAddTab={onAddTab}
          onTabSelect={onTabSelect}
          onTabSelectFromDropdown={onTabSelectFromDropdown}
          onContainerWidthChange={onContainerWidthChange}
          isDraggable
        />
      </DragDropContext>
    );
  }

  return (
    <TabListContentBody
      visibleTabs={visibleTabs}
      visibleTabCount={visibleTabCount}
      activeTabId={activeTabId}
      loading={loading}
      behaveAsLinks={behaveAsLinks}
      className={className}
      componentInstanceId={componentInstanceId}
      onAddTab={onAddTab}
      onTabSelect={onTabSelect}
      onTabSelectFromDropdown={onTabSelectFromDropdown}
      onContainerWidthChange={onContainerWidthChange}
      isDraggable={false}
    />
  );
};
