import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';

export const StyledSummaryCard = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

export const StyledSummaryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

export const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const StyledBadgeGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const StyledStatusBadge = styled.span<{ isSuccess: boolean }>`
  align-items: center;
  background: ${({ isSuccess }) =>
    isSuccess
      ? themeCssVariables.background.transparent.success
      : themeCssVariables.background.transparent.danger};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ isSuccess }) =>
    isSuccess ? themeCssVariables.color.green : themeCssVariables.color.red};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
`;

export const StyledMetricsRow = styled.div`
  align-items: stretch;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
`;

export const StyledMetric = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

export const StyledMetricLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

export const StyledMetricValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const StyledSectionTitle = styled.h3`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  margin: 0;
  text-transform: uppercase;
`;

export const StyledErrorCard = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.color.red};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

export const StyledErrorMessageText = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const StyledEmptyHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-style: italic;
`;

export const StyledBodyMeta = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;
