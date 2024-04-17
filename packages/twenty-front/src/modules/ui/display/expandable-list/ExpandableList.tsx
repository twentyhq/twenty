import React, { ReactElement, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { Chip, ChipVariant } from 'twenty-ui';

import { IntersectionObserverWrapper } from '@/ui/display/expandable-list/IntersectionObserverWrapper';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  white-space: nowrap;
  overflow-x: hidden;
`;

const StyledExpendableCell = styled.div`
  align-content: center;
  align-items: center;
  backdrop-filter: ${({ theme }) => theme.blur.strong};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
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

  const containerRef = useRef<HTMLDivElement>(null);

  const divRef = useRef<HTMLDivElement>(null);

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
                  <>
                    {divRef.current &&
                      createPortal(
                        <StyledExpendableCell>
                          {listItems}
                        </StyledExpendableCell>,
                        divRef.current as HTMLElement,
                      )}
                  </>
                }
              />
            )}
        </React.Fragment>
      ))}
      <div
        ref={divRef}
        style={{
          position: 'absolute',
          top: '100%',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      ></div>
    </StyledContainer>
  );
};
