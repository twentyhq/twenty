import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconArrowUpRight } from 'twenty-ui/display';

const StyledTooltip = styled.div<{ $interactive?: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: min(300px, calc(100vw - 40px));
  min-width: 160px;
  pointer-events: ${({ $interactive }) => ($interactive ? 'auto' : 'none')};
`;

const StyledTooltipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;

  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTooltipRowContainer = styled.div<{ $scrollable?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-height: ${({ $scrollable }) => ($scrollable ? '120px' : 'none')};
  overflow-y: ${({ $scrollable }) => ($scrollable ? 'auto' : 'visible')};
`;

const StyledDot = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 50%;
  height: 6px;
  width: 6px;
  flex-shrink: 0;
`;

const StyledTooltipLink = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: default;
  display: flex;
  justify-content: space-between;
  height: ${({ theme }) => theme.spacing(6)};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  line-height: 140%;
`;

const StyledTooltipSeparator = styled.div`
  background-color: ${({ theme }) => theme.border.color.light};
  min-height: 1px;
  width: 100%;
`;

const StyledTooltipHeader = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 140%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTooltipRowRightContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.extraLight};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  width: 100%;
`;

const StyledTooltipLabel = styled.span<{ $isHighlighted?: boolean }>`
  color: ${({ theme, $isHighlighted }) =>
    $isHighlighted ? theme.font.color.secondary : theme.font.color.tertiary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${({ theme, $isHighlighted }) =>
    $isHighlighted ? theme.font.weight.medium : theme.font.weight.regular};
`;

const StyledTooltipValue = styled.span<{ $isHighlighted?: boolean }>`
  color: ${({ theme, $isHighlighted }) =>
    $isHighlighted ? theme.font.color.tertiary : theme.font.color.extraLight};
  flex-shrink: 0;
  font-weight: ${({ theme, $isHighlighted }) =>
    $isHighlighted ? theme.font.weight.semiBold : theme.font.weight.medium};
  white-space: nowrap;
`;

const StyledHorizontalSectionPadding = styled.div<{
  $addTop?: boolean;
  $addBottom?: boolean;
}>`
  padding-inline: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ $addTop, theme }) => ($addTop ? theme.spacing(1) : 0)};
  margin-bottom: ${({ $addBottom, theme }) =>
    $addBottom ? theme.spacing(1) : 0};
`;

export type GraphWidgetTooltipItem = {
  key: string;
  label: string;
  formattedValue: string;
  value: number;
  dotColor: string;
};

type GraphWidgetTooltipProps = {
  items: GraphWidgetTooltipItem[];
  showClickHint?: boolean;
  indexLabel?: string;
  interactive?: boolean;
  scrollable?: boolean;
  highlightedKey?: string;
};

export const GraphWidgetTooltip = ({
  items,
  showClickHint = false,
  indexLabel,
  interactive = false,
  scrollable = false,
  highlightedKey,
}: GraphWidgetTooltipProps) => {
  const theme = useTheme();

  const filteredItems = items.filter(
    (item) => item.value !== 0 && isNonEmptyString(item.formattedValue),
  );

  const shouldHighlight = filteredItems.length > 1;

  return (
    <StyledTooltip $interactive={interactive}>
      <StyledHorizontalSectionPadding $addTop $addBottom={!showClickHint}>
        <StyledTooltipContent>
          {indexLabel && (
            <StyledTooltipHeader>{indexLabel}</StyledTooltipHeader>
          )}
          <StyledTooltipRowContainer $scrollable={scrollable}>
            {filteredItems.map((item, index) => {
              const isHighlighted =
                shouldHighlight && highlightedKey === item.key;
              return (
                <StyledTooltipRow key={index}>
                  <StyledDot $color={item.dotColor} />
                  <StyledTooltipRowRightContent>
                    <StyledTooltipLabel $isHighlighted={isHighlighted}>
                      {item.label}
                    </StyledTooltipLabel>
                    <StyledTooltipValue $isHighlighted={isHighlighted}>
                      {item.formattedValue}
                    </StyledTooltipValue>
                  </StyledTooltipRowRightContent>
                </StyledTooltipRow>
              );
            })}
          </StyledTooltipRowContainer>
        </StyledTooltipContent>
      </StyledHorizontalSectionPadding>
      {showClickHint && (
        <>
          <StyledTooltipSeparator />
          <StyledHorizontalSectionPadding $addBottom>
            <StyledTooltipLink>
              <span>{t`Click to see data`}</span>
              <IconArrowUpRight size={theme.icon.size.sm} />
            </StyledTooltipLink>
          </StyledHorizontalSectionPadding>
        </>
      )}
    </StyledTooltip>
  );
};
