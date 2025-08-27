import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type ReactNode, useState } from 'react';
import { TableBody } from './TableBody';
import { IconChevronDown, IconChevronUp, Label } from 'twenty-ui/display';

type TableSectionProps = {
  children: ReactNode;
  isInitiallyExpanded?: boolean;
  title: string;
};

const StyledSectionHeader = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: left;
`;

const StyledSection = styled.div<{ isExpanded: boolean }>`
  max-height: ${({ isExpanded }) => (isExpanded ? 'fit-content' : 0)};
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
  overflow: hidden;
  transition:
    max-height ${({ theme }) => theme.animation.duration.normal}s,
    opacity ${({ theme }) => theme.animation.duration.normal}s;
`;

const StyledSectionContent = styled(TableBody)`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const TableSection = ({
  children,
  isInitiallyExpanded = true,
  title,
}: TableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const theme = useTheme();

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
        <StyledSectionContent>{children}</StyledSectionContent>
      </StyledSection>
    </>
  );
};
