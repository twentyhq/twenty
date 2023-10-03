import { ReactNode, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconChevronDown, IconChevronUp } from '@/ui/icon';

type TableSectionProps = {
  children: ReactNode;
  title: string;
};

const StyledTableBody = styled.tbody<{ isExpanded: boolean }>`
  border-bottom: ${({ isExpanded, theme }) =>
    isExpanded ? `1px solid ${theme.border.color.light}` : 0};

  &:first-of-type {
    border-top: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  }

  td > div {
    ${({ isExpanded }) => (isExpanded ? '' : 'height: 0; opacity: 0;')};
    overflow: hidden;
    transition: height ${({ theme }) => theme.animation.duration.normal}s,
      opacity ${({ theme }) => theme.animation.duration.normal}s;
  }
`;

const StyledTh = styled.th`
  padding: 0;
`;

const StyledSectionHeader = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-align: left;
  text-transform: uppercase;
`;

export const TableSection = ({ children, title }: TableSectionProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleSection = () =>
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);

  return (
    <StyledTableBody isExpanded={isExpanded}>
      <tr>
        <StyledTh colSpan={500} scope="rowgroup">
          <StyledSectionHeader
            isExpanded={isExpanded}
            onClick={handleToggleSection}
          >
            {title}
            {isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledSectionHeader>
        </StyledTh>
      </tr>
      {children}
    </StyledTableBody>
  );
};
