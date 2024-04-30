import { Dispatch, ReactElement, SetStateAction } from 'react';
import styled from '@emotion/styled';

import { ChildrenProperty } from '@/ui/display/expandable-list/ExpandableList';

const StyledChildContainer = styled.div<{
  shrink?: number;
  isVisible?: boolean;
  displayHiddenCount?: boolean;
}>`
  display: ${({ isVisible = true }) => (isVisible ? 'flex' : 'none')};
  flex-shrink: ${({ shrink = 1 }) => shrink};
  overflow: ${({ displayHiddenCount }) =>
    displayHiddenCount ? 'hidden' : 'none'};
`;

const StyledChildrenContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;
export const ChildrenContainer = ({
  children,
  childrenProperties,
  setChildrenProperties,
  isFocusedMode,
}: {
  children: ReactElement[];
  childrenProperties: Record<number, ChildrenProperty>;
  setChildrenProperties: Dispatch<
    SetStateAction<Record<number, ChildrenProperty>>
  >;
  isFocusedMode: boolean;
}) => {
  return (
    <StyledChildrenContainer>
      {children.map((child, index) => {
        return (
          <StyledChildContainer
            ref={(el) => {
              if (!el || isFocusedMode) return;
              setChildrenProperties((prevState) => {
                prevState[index] = {
                  ...prevState[index],
                  width: el.getBoundingClientRect().width,
                  shrink: 0,
                  isVisible: true,
                };
                return prevState;
              });
            }}
            key={index}
            displayHiddenCount={isFocusedMode}
            isVisible={childrenProperties[index]?.isVisible}
            shrink={childrenProperties[index]?.shrink}
          >
            {child}
          </StyledChildContainer>
        );
      })}
    </StyledChildrenContainer>
  );
};
