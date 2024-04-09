import React, { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

import { ExpandableListPlus } from '@/activities/calendar/components/ExpandableListPlus';
import { IntersectionObserverWrapper } from '@/activities/calendar/components/IntersectionObserverWrapper';

export const ExpandableList = ({
  components,
  rootRef,
  margin,
}: {
  components: ReactElement[];
  rootRef: React.RefObject<HTMLElement>;
  margin?: string;
}) => {
  const [componentsInView, setComponentsInView] = useState(new Set<number>());

  const [isExpanded, setIsExpanded] = useState(false);

  const firstComponent = components[0];

  return (
    <StyledContainer>
      {firstComponent}
      {components.slice(1).map((component, index) => (
        <React.Fragment key={index}>
          <IntersectionObserverWrapper
            set={setComponentsInView}
            id={index}
            rootRef={rootRef}
            margin={margin}
          >
            {component}
          </IntersectionObserverWrapper>
          {index === componentsInView.size - 1 &&
            components.length - componentsInView.size - 1 !== 0 && (
              <ExpandableListPlus
                number={components.length - componentsInView.size - 1}
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
        </React.Fragment>
      ))}
      <StyledExpendableCell isExpanded={isExpanded}>
        {components}
      </StyledExpendableCell>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  white-space: nowrap;
  max-width: 100%;
  box-sizing: border-box;
`;

const StyledExpendableCell = styled.div<{ isExpanded: boolean }>`
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  display: ${({ isExpanded }) => (isExpanded ? 'flex' : 'none')};
  flex-flow: row wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  width: 300px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.background.secondary};
`;
