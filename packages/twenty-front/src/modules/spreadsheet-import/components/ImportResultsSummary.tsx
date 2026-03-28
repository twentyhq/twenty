import {
  type BatchCreateResult,
  type ImportRecordWarning,
} from '@/object-record/hooks/useBatchCreateManyRecords';
import { type LeadResolutionResult } from '@/spreadsheet-import/utils/applyLeadResolutions';
import { generateProblemRowsCsv } from '@/spreadsheet-import/utils/generateProblemRowsCsv';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]} 0;
  min-width: 360px;
`;

const StyledStatusLine = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${({ color }) => color};
`;

const StyledIssueList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledIssueItem = styled.div`
  padding: ${themeCssVariables.spacing[1]} 0;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledDownloadButton = styled.button`
  align-self: flex-start;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  background: ${themeCssVariables.color.blue5};
  color: ${themeCssVariables.color.blue};
  border: 1px solid ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.grayScale.gray1};
  }
`;

const MAX_DISPLAYED_ISSUES = 50;

const formatWarningMessage = (warning: ImportRecordWarning): string => {
  const reasonMap: Record<string, string> = {
    CONNECT_NOT_FOUND: 'not found',
    CONNECT_AMBIGUOUS: 'multiple matches',
    CONNECT_CREATE_FAILED: 'auto-create failed',
  };

  const reason = reasonMap[warning.reason] ?? warning.reason;

  return `${warning.connectFieldName}: ${reason} (${warning.condition})`;
};

type ImportResultsSummaryProps = {
  totalRecords: number;
  successCount: number;
  warnings: ImportRecordWarning[];
  failures: BatchCreateResult<any>['failures'];
  originalRows: Record<string, unknown>[];
  columns: Array<{ key: string; label: string }>;
  objectNameSingular: string;
  fuzzyResolutionResult?: LeadResolutionResult;
};

export const ImportResultsSummary = ({
  totalRecords,
  successCount,
  warnings,
  failures,
  originalRows,
  columns,
  objectNameSingular,
  fuzzyResolutionResult,
}: ImportResultsSummaryProps) => {
  const warningCount = warnings.length;
  const failureCount = failures.length;
  const reviewCount = fuzzyResolutionResult?.flaggedForReview?.length ?? 0;
  const autoResolvedCount =
    (fuzzyResolutionResult?.autoResolved ?? 0) +
    (fuzzyResolutionResult?.created ?? 0);
  const issueCount = warningCount + failureCount;

  const handleDownload = () => {
    generateProblemRowsCsv({
      warnings,
      failures,
      originalRows,
      columns,
      objectNameSingular,
    });
  };

  return (
    <StyledContainer>
      <StyledStatusLine color={themeCssVariables.color.green}>
        {t`${successCount} of ${totalRecords} records imported successfully`}
      </StyledStatusLine>

      {autoResolvedCount > 0 && (
        <StyledStatusLine color={themeCssVariables.color.blue}>
          {t`${autoResolvedCount} lead(s) auto-matched and updated`}
        </StyledStatusLine>
      )}

      {reviewCount > 0 && (
        <StyledStatusLine color={themeCssVariables.color.orange}>
          {t`${reviewCount} lead(s) need manual review (70-94% match)`}
        </StyledStatusLine>
      )}

      {warningCount > 0 && (
        <StyledStatusLine color={themeCssVariables.color.yellow}>
          {t`${warningCount} records imported with warnings`}
        </StyledStatusLine>
      )}

      {failureCount > 0 && (
        <StyledStatusLine color={themeCssVariables.color.red}>
          {t`${failureCount} batch(es) failed`}
        </StyledStatusLine>
      )}

      {issueCount > 0 && (
        <>
          <StyledIssueList>
            {warnings.slice(0, MAX_DISPLAYED_ISSUES).map((warning, i) => (
              <StyledIssueItem key={`w-${i}`}>
                {warning.recordId
                  ? `${warning.recordId.slice(0, 8)}… — `
                  : ''}
                {formatWarningMessage(warning)}
              </StyledIssueItem>
            ))}
            {failures.slice(0, MAX_DISPLAYED_ISSUES - warningCount).map((failure, i) => (
              <StyledIssueItem key={`f-${i}`}>
                {t`Batch error: ${failure.error}`}
              </StyledIssueItem>
            ))}
            {issueCount > MAX_DISPLAYED_ISSUES && (
              <StyledIssueItem>
                {t`...and ${issueCount - MAX_DISPLAYED_ISSUES} more (see downloaded CSV)`}
              </StyledIssueItem>
            )}
          </StyledIssueList>

          <StyledDownloadButton onClick={handleDownload}>
            {t`Download problem rows CSV`}
          </StyledDownloadButton>
        </>
      )}
    </StyledContainer>
  );
};
