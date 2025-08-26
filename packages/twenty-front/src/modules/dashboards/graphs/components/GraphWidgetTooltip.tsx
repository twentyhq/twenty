import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowUpRight } from 'twenty-ui/display';

const StyledTooltipContent = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  pointer-events: none;
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.extraLight};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDot = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

const StyledTooltipValue = styled.span`
  margin-left: auto;
  white-space: nowrap;
`;

const StyledTooltipLink = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: default;
  display: flex;
`;

export type GraphWidgetTooltipItem = {
  label: string;
  formattedValue: string;
  dotColor: string;
};

type GraphWidgetTooltipProps = {
  items: GraphWidgetTooltipItem[];
  showClickHint?: boolean;
};

export const GraphWidgetTooltip = ({
  items,
  showClickHint = false,
}: GraphWidgetTooltipProps) => {
  const theme = useTheme();

  return (
    <StyledTooltipContent>
      {items.map((item, index) => (
        <StyledTooltipRow key={index}>
          <StyledDot $color={item.dotColor} />
          <span>{item.label}</span>
          <StyledTooltipValue>{item.formattedValue}</StyledTooltipValue>
        </StyledTooltipRow>
      ))}
      {showClickHint && (
        <StyledTooltipLink>
          <span>{t`Click to see data`}</span>
          <IconArrowUpRight size={theme.icon.size.sm} />
        </StyledTooltipLink>
      )}
    </StyledTooltipContent>
  );
};
