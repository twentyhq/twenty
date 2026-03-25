import { Draggable } from '@hello-pangea/dnd';

import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { StyledTabContainer, TabContent } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type PageLayoutTabListReorderableTabProps = {
  tab: SingleTabProps;
  index: number;
  isActive: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

const StyledTabContentWrapper = styled.div<{ isBeingEdited: boolean }>`
  outline: ${({ isBeingEdited }) =>
    isBeingEdited ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
  outline-offset: -1px;
`;

export const PageLayoutTabListReorderableTab = ({
  tab,
  index,
  isActive,
  disabled,
  onSelect,
}: PageLayoutTabListReorderableTabProps) => {
  const pageLayoutTabSettingsOpenTabId = useAtomComponentStateValue(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );

  const isSettingsOpenForThisTab = pageLayoutTabSettingsOpenTabId === tab.id;
  return (
    <Draggable draggableId={tab.id} index={index} isDragDisabled={disabled}>
      {(draggableProvided, draggableSnapshot) => (
        <StyledTabContainer
          ref={draggableProvided.innerRef}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.draggableProps}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...draggableProvided.dragHandleProps}
          onClick={draggableSnapshot.isDragging ? undefined : onSelect}
          active={isActive}
          disabled={disabled}
          style={{
            ...draggableProvided.draggableProps.style,
            cursor: draggableSnapshot.isDragging ? 'grabbing' : 'pointer',
          }}
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
      )}
    </Draggable>
  );
};
