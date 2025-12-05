import { Draggable } from '@hello-pangea/dnd';

import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

const StyledTabContent = styled(TabContent)<{ isBeingEdited: boolean }>`
  outline: ${({ isBeingEdited, theme }) =>
    isBeingEdited ? `1px solid ${theme.color.blue}` : 'none'};
  outline-offset: -1px;
`;

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  isActive,
  disabled,
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  const tabSettingsOpenTabId = useRecoilComponentValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );

  const isSettingsOpenForThisTab = tabSettingsOpenTabId === tab.id;
  return (
    <Draggable draggableId={tab.id} index={index} isDragDisabled={disabled}>
      {(draggableProvided, draggableSnapshot) => (
        <StyledTabContainer
          ref={draggableProvided.innerRef}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.dragHandleProps}
          onClick={draggableSnapshot.isDragging ? undefined : onSelect}
          active={isActive}
          disabled={disabled}
          style={{
            ...draggableProvided.draggableProps.style,
            cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
          }}
        >
          <StyledTabContent
            id={tab.id}
            active={isActive}
            disabled={disabled}
            LeftIcon={tab.Icon}
            title={tab.title}
            logo={tab.logo}
            pill={tab.pill}
            isBeingEdited={isSettingsOpenForThisTab}
          />
        </StyledTabContainer>
      )}
    </Draggable>
  );
};
