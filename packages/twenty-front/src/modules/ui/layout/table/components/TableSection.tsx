import { styled } from '@linaria/react';
import { type ReactNode, useContext, useState } from 'react';
import { TableBody } from './TableBody';
import { IconChevronDown, IconChevronUp, Label } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type TableSectionProps = {
  children: ReactNode;
  isInitiallyExpanded?: boolean;
  title: string;
};

const StyledSectionHeader = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  cursor: pointer;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledSection = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => (isExpanded ? 'fit-content' : '0')};
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
  overflow: hidden;
  transition:
    max-height calc(${themeCssVariables.animation.duration.normal} * 1s),
    opacity calc(${themeCssVariables.animation.duration.normal} * 1s);
`;

const StyledSectionContentContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const TableSection = ({
  children,
  isInitiallyExpanded = true,
  title,
}: TableSectionProps) => {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const handleToggleSection = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <>
      <StyledSectionHeader
        isExpanded={isExpanded}
        onClick={handleToggleSection}
      >
        <Label>{title}</Label>
        {isExpanded ? (
          <IconChevronUp
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <IconChevronDown
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
      </StyledSectionHeader>
      <StyledSection isExpanded={isExpanded}>
        <StyledSectionContentContainer>
          <TableBody>{children}</TableBody>
        </StyledSectionContentContainer>
      </StyledSection>
    </>
  );
};
