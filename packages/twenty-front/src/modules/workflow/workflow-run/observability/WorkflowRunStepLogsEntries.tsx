import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
import {
  StyledSection,
  StyledSectionTitle,
} from '@/workflow/workflow-run/observability/workflowRunStepLogsStyles';

const StyledEntriesList = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.sm};
  max-height: 300px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledEntryRow = styled.div`
  align-items: baseline;
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: max-content max-content 1fr;
  padding: ${themeCssVariables.spacing['0.5']} 0;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledLevelBadge = styled.span<{ level: string }>`
  background: ${({ level }) => {
    if (level === 'error')
      return themeCssVariables.background.transparent.danger;
    if (level === 'warn')
      return themeCssVariables.background.transparent.orange;
    if (level === 'info') return themeCssVariables.background.transparent.blue;
    return themeCssVariables.background.transparent.light;
  }};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ level }) => {
    if (level === 'error') return themeCssVariables.color.red;
    if (level === 'warn') return themeCssVariables.color.orange;
    if (level === 'info') return themeCssVariables.color.blue;
    return themeCssVariables.font.color.tertiary;
  }};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: 0 ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledMessage = styled.span`
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString();
};

export const WorkflowRunStepLogsEntries = ({
  entries,
  onlyLatestIteration = false,
}: {
  entries: WorkflowRunStepLog['entries'];
  // Set when the parent step lives inside an iterator loop: each iteration
  // overwrites the same `stepLogs[stepId]` key, so what we render here is
  // only the latest iteration's entries — not a cumulative view.
  onlyLatestIteration?: boolean;
}) => {
  const { t } = useLingui();

  if (entries.length === 0) {
    return null;
  }

  const sectionTitle = onlyLatestIteration
    ? t`Entries (${entries.length}, latest iteration only)`
    : t`Entries (${entries.length})`;

  return (
    <StyledSection>
      <StyledSectionTitle>{sectionTitle}</StyledSectionTitle>
      <StyledEntriesList>
        {entries.map((entry, index) => (
          <StyledEntryRow key={`${entry.timestamp}-${index}`}>
            <StyledTimestamp>
              {formatTimestamp(entry.timestamp)}
            </StyledTimestamp>
            <StyledLevelBadge level={entry.level}>
              {entry.level}
            </StyledLevelBadge>
            <StyledMessage>{entry.message}</StyledMessage>
          </StyledEntryRow>
        ))}
      </StyledEntriesList>
    </StyledSection>
  );
};
