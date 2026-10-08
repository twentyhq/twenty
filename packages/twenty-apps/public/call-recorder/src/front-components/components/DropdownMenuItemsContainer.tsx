import styled from '@emotion/styled';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledExternalContainer = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 0;
  padding: ${() => themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledScrollableContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  min-height: 0;
  overflow-y: auto;
  scrollbar-color: ${() => themeCssVariables.border.color.medium} transparent;
  scrollbar-width: thin;
  width: 100%;
`;

const StyledInternalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
`;

export const DropdownMenuItemsContainer = ({
  children,
}: {
  children: ReactNode;
}) => (
  <StyledExternalContainer>
    <StyledScrollableContainer>
      <StyledInternalContainer>{children}</StyledInternalContainer>
    </StyledScrollableContainer>
  </StyledExternalContainer>
);
