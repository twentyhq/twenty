import React, { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

import { IntersectionObserverWrapper } from '@/activities/components/ExpandableList/IntersectionObserverWrapper';
import { Chip, ChipVariant } from '@/ui/display/chip/components/Chip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  white-space: nowrap;
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
`;

const StyledExpendableCell = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  z-index: 1;
  box-sizing: border-box;
  background: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

export const ExpandableList = ({
  listItems,
  rootRef,
  id,
}: {
  listItems: ReactElement[];
  rootRef: React.RefObject<HTMLElement>;
  id: string;
}) => {
  const [listItemsInView, setListItemsInView] = useState(new Set<number>());

  const firstListItem = listItems[0];

  const dropdownId = `expandable-list-dropdown-${id}`;

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <StyledContainer ref={containerRef}>
      {firstListItem}
      {listItems.slice(1).map((listItem, index) => (
        <React.Fragment key={index}>
          <IntersectionObserverWrapper
            set={setListItemsInView}
            id={index}
            rootRef={rootRef}
          >
            {listItem}
          </IntersectionObserverWrapper>
          {index === listItemsInView.size - 1 &&
            listItems.length - listItemsInView.size - 1 !== 0 && (
              <Dropdown
                dropdownId={dropdownId}
                dropdownHotkeyScope={{
                  scope: dropdownId,
                }}
                clickableComponent={
                  <Chip
                    label={`+${listItems.length - listItemsInView.size - 1}`}
                    variant={ChipVariant.Highlighted}
                  />
                }
                dropdownComponents={
                  <StyledExpendableCell>{listItems}</StyledExpendableCell>
                }
                dropdownPlacement="bottom-start"
              />
            )}
        </React.Fragment>
      ))}
    </StyledContainer>
  );
};
