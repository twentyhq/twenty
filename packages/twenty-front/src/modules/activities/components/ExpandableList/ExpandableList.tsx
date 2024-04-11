import React, { ReactElement, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

import { IntersectionObserverWrapper } from '@/activities/components/ExpandableList/IntersectionObserverWrapper';
import { Chip, ChipVariant } from '@/ui/display/chip/components/Chip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  box-sizing: border-box;
`;

const StyledDiv = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  white-space: nowrap;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const StyledExpendableCell = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  position: absolute;
  top: ${({ theme }) => `-${theme.spacing(2.25)}`};
  left: ${({ theme }) => `-${theme.spacing(2.25)}`};
  width: 232px;
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
  components,
  rootRef,
  id,
  margin,
}: {
  components: ReactElement[];
  rootRef: React.RefObject<HTMLElement>;
  id: string;
  margin?: string;
}) => {
  const [componentsInView, setComponentsInView] = useState(new Set<number>());

  const firstComponent = components[0];

  const dropdownId = `expandable-list-dropdown-${id}`;

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <StyledContainer ref={containerRef}>
      <StyledDiv>
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
                <Dropdown
                  dropdownId={dropdownId}
                  dropdownHotkeyScope={{
                    scope: dropdownId,
                  }}
                  clickableComponent={
                    <Chip
                      label={`+${
                        components.length - componentsInView.size - 1
                      }`}
                      variant={ChipVariant.Highlighted}
                    />
                  }
                  dropdownComponents={ReactDOM.createPortal(
                    <StyledExpendableCell>{components}</StyledExpendableCell>,
                    containerRef.current as HTMLDivElement,
                  )}
                  disableBorder
                />
              )}
          </React.Fragment>
        ))}
      </StyledDiv>
    </StyledContainer>
  );
};
