import { TabActionsDropdown } from '@/ui/layout/tab-list/components/TabActionsDropdown';
import { TabInlineRenameInput } from '@/ui/layout/tab-list/components/TabInlineRenameInput';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { isDefined } from 'twenty-shared/utils';
import { TabButton } from 'twenty-ui/input';

const StyledDraggableWrapper = styled.div`
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const StyledTabButtonWrapper = styled.div`
  display: flex;
  height: 100%;
  pointer-events: none;
`;

type TabListDraggableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  isDisabled: boolean | undefined;
  onSelect: () => void;
};

export const TabListDraggableTab = ({
  tab,
  index,
  isActive,
  isDisabled,
  onSelect,
}: TabListDraggableTabProps) => {
  const {
    tabActions,
    visibleTabs,
    tabInRenameMode,
    onEnterRenameMode,
    onExitRenameMode,
  } = useTabListContextOrThrow();

  const hasTabActions = isDefined(tabActions);
  const canDeleteTab = visibleTabs.length > 1;
  const isInRenameMode = tabInRenameMode === tab.id;

  const handleClick = () => {
    // If tab is already active and tabActions exist, dropdown will handle it
    // Otherwise, select the tab
    if (!isActive) {
      onSelect();
    }
  };

  const handleRename = () => {
    onEnterRenameMode(tab.id);
  };

  const handleRenameSave = (newTitle: string) => {
    onExitRenameMode();
    if (newTitle !== tab.title && newTitle.length > 0) {
      tabActions?.onRename?.(tab.id, newTitle);
    }
  };

  const handleRenameCancel = () => {
    onExitRenameMode();
  };

  const handleDuplicateLeft = () => {
    // Placeholder for Phase 3
    console.log('Duplicate left:', tab.id);
    tabActions?.onDuplicate?.(tab.id, 'before');
  };

  const handleDuplicateRight = () => {
    // Placeholder for Phase 3
    console.log('Duplicate right:', tab.id);
    tabActions?.onDuplicate?.(tab.id, 'after');
  };

  const handleDelete = () => {
    // Placeholder for Phase 4
    console.log('Delete tab:', tab.id);
    tabActions?.onDelete?.(tab.id);
  };

  return (
    <Draggable draggableId={tab.id} index={index} isDragDisabled={isDisabled}>
      {(draggableProvided, draggableSnapshot) => {
        const draggableStyle = draggableProvided.draggableProps.style;

        const tabButton = (
          <StyledDraggableWrapper
            ref={draggableProvided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...draggableProvided.dragHandleProps}
            onClick={
              draggableSnapshot.isDragging
                ? undefined
                : hasTabActions && isActive
                  ? undefined // Let dropdown handle click
                  : handleClick
            }
            style={{
              ...draggableStyle,
              cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
            }}
          >
            <StyledTabButtonWrapper>
              {isInRenameMode ? (
                <TabInlineRenameInput
                  initialValue={tab.title}
                  onSave={handleRenameSave}
                  onCancel={handleRenameCancel}
                />
              ) : (
                <TabButton
                  id={tab.id}
                  title={tab.title}
                  LeftIcon={tab.Icon}
                  logo={tab.logo}
                  active={isActive}
                  disabled={isDisabled}
                  pill={tab.pill}
                />
              )}
            </StyledTabButtonWrapper>
          </StyledDraggableWrapper>
        );

        // If tab is active and has actions, wrap in dropdown (but not if in rename mode)
        if (
          hasTabActions &&
          isActive &&
          !draggableSnapshot.isDragging &&
          !isInRenameMode
        ) {
          return (
            <TabActionsDropdown
              dropdownId={`tab-actions-${tab.id}`}
              clickableComponent={tabButton}
              onRename={handleRename}
              onDuplicateLeft={handleDuplicateLeft}
              onDuplicateRight={handleDuplicateRight}
              onDelete={handleDelete}
              isDeleteDisabled={!canDeleteTab}
            />
          );
        }

        return tabButton;
      }}
    </Draggable>
  );
};
