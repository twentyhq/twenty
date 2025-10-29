import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowUpRight } from 'twenty-ui/display';

const StyledTooltip = styled.div`
  background: ${({ theme }) => theme.background.transparent.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  pointer-events: none;
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

const StyledTooltipRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
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
  background-color: ${({ theme }) =>
    theme.name === 'dark'
      ? theme.background.transparent.light
      : theme.border.color.light};
  min-height: 1px;
  width: 100%;
`;

const StyledTooltipHeader = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: 140%;
`;

const StyledTooltipRowRightContent = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.extraLight};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  width: 100%;
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
  label: string;
  formattedValue: string;
  dotColor: string;
};

type GraphWidgetTooltipProps = {
  items: GraphWidgetTooltipItem[];
  showClickHint?: boolean;
  indexLabel?: string;
};

export const GraphWidgetTooltip = ({
  items,
  showClickHint = false,
  indexLabel,
}: GraphWidgetTooltipProps) => {
  const theme = useTheme();

  return (
    <StyledTooltip>
      <StyledHorizontalSectionPadding $addTop $addBottom={!showClickHint}>
        <StyledTooltipContent>
          {indexLabel && (
            <StyledTooltipHeader>{indexLabel}</StyledTooltipHeader>
          )}
          <StyledTooltipRowContainer>
            {items.map((item, index) => (
              <StyledTooltipRow key={index}>
                <StyledDot $color={item.dotColor} />
                <StyledTooltipRowRightContent>
                  <span>{item.label}</span>
                  <span>{item.formattedValue}</span>
                </StyledTooltipRowRightContent>
              </StyledTooltipRow>
            ))}
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
