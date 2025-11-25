import { CHART_LEGEND_ITEM_THRESHOLD } from '@/page-layout/widgets/graph/constants/ChartLegendItemThreshold';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';

export type GraphWidgetLegendItem = {
  id: string;
  label: string;
  color: string;
};

type GraphWidgetLegendProps = {
  items: GraphWidgetLegendItem[];
  show?: boolean;
};

const StyledLegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledLegendItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLegendLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDot = styled.div<{ color: string }>`
  background: ${({ color }) => color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

const StyledPaginationContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPaginationIndicator = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledPaginationButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.font.color.primary};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.extraLight};
    cursor: not-allowed;
  }
`;

export const GraphWidgetLegend = ({
  items,
  show = true,
}: GraphWidgetLegendProps) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const isItASingleItem = items.length === 1;
  const thereAreNoItems = items.length === 0;

  const shouldShowLegend = show && !isItASingleItem && !thereAreNoItems;

  if (!shouldShowLegend) {
    return null;
  }

  const needsPagination = items.length > CHART_LEGEND_ITEM_THRESHOLD;

  const totalPages = Math.ceil(items.length / CHART_LEGEND_ITEM_THRESHOLD);

  const startIndex = currentPage * CHART_LEGEND_ITEM_THRESHOLD;

  const endIndex = startIndex + CHART_LEGEND_ITEM_THRESHOLD;

  const visibleItems = needsPagination
    ? items.slice(startIndex, endIndex)
    : items;

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(totalPages - 1, prevPage + 1));
  };

  return (
    <StyledLegendContainer>
      {needsPagination && (
        <StyledPaginationContainer>
          <StyledPaginationButton
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            <IconChevronUp size={theme.icon.size.sm} />
          </StyledPaginationButton>
          <StyledPaginationIndicator>
            {currentPage + 1}/{totalPages}
          </StyledPaginationIndicator>
          <StyledPaginationButton
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledPaginationButton>
        </StyledPaginationContainer>
      )}
      {visibleItems.map((item) => (
        <StyledLegendItem key={item.id}>
          <StyledDot color={item.color} />
          <StyledLegendLabel>{item.label}</StyledLegendLabel>
        </StyledLegendItem>
      ))}
    </StyledLegendContainer>
  );
};
