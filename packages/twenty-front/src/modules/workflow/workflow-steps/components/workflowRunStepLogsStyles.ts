import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/workflow/workflow-steps/components/workflowRunStepLogsFormatters';

// Shared visual primitives for the `WorkflowRunStepLogs*` detail components
// (`AI_AGENT`, `CODE`, `HTTP_REQUEST`, `EMAIL`, …). The goal is to keep the
// log surface visually consistent across step types while leaving each
// component free to layer on type-specific styling (model badge, recipient
// table, header table, etc.).

// ---------------------------------------------------------------------------
// Summary card (icon + title on the left, badges on the right)
// ---------------------------------------------------------------------------

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

// `min-width: 0` lets the title truncate inside flex layouts instead of
// pushing the right-side badge group off-screen.
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

// `isSuccess` toggles green / red surfaces. Used by step types that have a
// binary outcome (CODE, EMAIL, HTTP_REQUEST). `inline-flex` is so callers
// can put an icon next to the label without extra wrappers.
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

// ---------------------------------------------------------------------------
// Metrics row (small icon + label above a large value, grid of cells)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Section (label + content vertical stack). Used for "Request", "Response",
// "Recipients", "Entries", "Error", …
// ---------------------------------------------------------------------------

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

// `display: flex` lets section titles optionally include a leading icon
// (e.g. ↑ Request, ↓ Response). Text-only titles render identically.
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

// ---------------------------------------------------------------------------
// Shared content blocks
// ---------------------------------------------------------------------------

// Outer error chrome: red surface + border. Layout-agnostic so it can host
// either a single text node (HTTP_REQUEST / EMAIL: `<StyledErrorCard>
// <StyledErrorMessageText>…</StyledErrorMessageText></StyledErrorCard>`) or
// a multi-child stack (CODE: header + message + stack trace).
export const StyledErrorCard = styled.div`
  background: ${themeCssVariables.background.transparent.danger};
  border: 1px solid ${themeCssVariables.color.red};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

// Monospace, wrap-friendly text node intended to live inside
// `StyledErrorCard` (or any equivalent container) when the error payload is
// a plain string.
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

// Caption shown under a body block describing its byte size / truncation.
export const StyledBodyMeta = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;
