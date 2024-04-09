import React, { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

import { IntersectionObserverWrapper } from '@/activities/calendar/components/ExpandableList/IntersectionObserverWrapper';
import { Chip, ChipVariant } from '@/ui/display/chip/components/Chip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

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

  const dropdownId = 'expandable-list-dropdown';

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
              <Dropdown
                dropdownId={dropdownId}
                dropdownHotkeyScope={{
                  scope: dropdownId,
                }}
                clickableComponent={
                  <Chip
                    label={`+${components.length - componentsInView.size - 1}`}
                    variant={ChipVariant.Highlighted}
                  />
                }
                dropdownOffset={{ x: 0, y: -20 }}
                dropdownComponents={
                  <StyledExpendableCell>{components}</StyledExpendableCell>
                }
              />
            )}
        </React.Fragment>
      ))}
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
  backdrop-filter: blur(20px);
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;
