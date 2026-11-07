import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconArrowRight } from 'twenty-ui/icon';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalOutcome } from '@/ai/components/AiChatApprovalOutcome';
import { type AiChatApprovalReviewCell } from '@/ai/types/AiChatApprovalReviewCell';
import { type AiChatApprovalReviewColumn } from '@/ai/types/AiChatApprovalReviewColumn';
import { type AiChatApprovalReviewRecord } from '@/ai/types/AiChatApprovalReviewRecord';

const APPROVAL_REVIEW_ROW_HEIGHT = 32;
const APPROVAL_REVIEW_STATUS_COLUMN_WIDTH = 140;
const APPROVAL_REVIEW_CHANGE_ICON_SIZE = 14;
const APPROVAL_REVIEW_SELECTION_WIDTH = 16;

const StyledTableViewport = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  overflow-x: auto;
`;

const StyledTable = styled.table<{ minimumWidth: number }>`
  border-collapse: collapse;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  min-width: ${({ minimumWidth }) => minimumWidth}px;
  table-layout: fixed;
  width: 100%;
`;

const StyledColumn = styled.col<{ columnWidth: number }>`
  width: ${({ columnWidth }) => columnWidth}px;
`;

const StyledHeaderCell = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
  padding: 0;
  text-align: left;

  &:not(:last-child) {
    border-right: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledRecordRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledCell = styled.td<{ isChanged?: boolean }>`
  background: ${({ isChanged }) =>
    isChanged ? themeCssVariables.background.transparent.blue : 'transparent'};
  padding: 0;

  &:not(:last-child) {
    border-right: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledCellContent = styled.div<{ alignment?: 'left' | 'right' }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: ${({ alignment }) =>
    alignment === 'right' ? 'flex-end' : 'flex-start'};
  min-height: ${APPROVAL_REVIEW_ROW_HEIGHT}px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledHeaderLabel = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledSelectionControl = styled.span`
  align-items: center;
  display: inline-flex;
  flex: 0 0 ${APPROVAL_REVIEW_SELECTION_WIDTH}px;
  justify-content: center;
`;

const StyledValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: inherit;
  min-width: 0;
`;

const StyledPreviousValue = styled.del`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledChangeIcon = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
`;

const StyledEmptyCell = styled.td`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

type AiChatApprovalRecordReviewProps = {
  label: string;
  columns: readonly AiChatApprovalReviewColumn[];
  records: readonly AiChatApprovalReviewRecord[];
  selectedRecordIds: readonly string[];
  onSelectedRecordIdsChange: (recordIds: string[]) => void;
  operation: 'create' | 'update' | 'delete';
  disabled?: boolean;
  renderCell: (cell: {
    recordId: string;
    columnId: string;
    isReadOnly: boolean;
  }) => AiChatApprovalReviewCell;
};

export const AiChatApprovalRecordReview = ({
  label,
  columns,
  records,
  selectedRecordIds,
  onSelectedRecordIdsChange,
  operation,
  disabled = false,
  renderCell,
}: AiChatApprovalRecordReviewProps) => {
  const { t } = useLingui();
  const selectedRecordIdSet = new Set(selectedRecordIds);
  const visibleSelectedRecordIds = records
    .filter(({ id }) => selectedRecordIdSet.has(id))
    .map(({ id }) => id);
  const hasRecords = isNonEmptyArray(records);
  const areAllRecordsSelected =
    hasRecords && visibleSelectedRecordIds.length === records.length;
  const areSomeRecordsSelected =
    isNonEmptyArray(visibleSelectedRecordIds) && !areAllRecordsSelected;
  const hasRecordStatuses = records.some(({ status }) => isDefined(status));
  const minimumWidth =
    columns.reduce((width, column) => width + column.width, 0) +
    (hasRecordStatuses ? APPROVAL_REVIEW_STATUS_COLUMN_WIDTH : 0);
  const isReadOnly = disabled || operation === 'delete';

  const handleRecordSelectionChange = ({
    recordId,
    isSelected,
  }: {
    recordId: string;
    isSelected: boolean;
  }) => {
    onSelectedRecordIdsChange(
      records
        .filter(({ id }) =>
          id === recordId ? isSelected : selectedRecordIdSet.has(id),
        )
        .map(({ id }) => id),
    );
  };

  return (
    <StyledTableViewport
      role="region"
      aria-label={t`Scrollable record review`}
      tabIndex={0}
    >
      <StyledTable aria-label={label} minimumWidth={minimumWidth}>
        <colgroup>
          {columns.map((column) => (
            <StyledColumn key={column.id} columnWidth={column.width} />
          ))}
          {hasRecordStatuses && (
            <StyledColumn columnWidth={APPROVAL_REVIEW_STATUS_COLUMN_WIDTH} />
          )}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <StyledHeaderCell key={column.id} scope="col">
                <StyledCellContent>
                  {columnIndex === 0 && (
                    <StyledSelectionControl>
                      <Checkbox
                        aria-label={t`Select all records`}
                        checked={areAllRecordsSelected}
                        indeterminate={areSomeRecordsSelected}
                        disabled={disabled || !hasRecords}
                        onCheckedChange={(isSelected) =>
                          onSelectedRecordIdsChange(
                            isSelected ? records.map(({ id }) => id) : [],
                          )
                        }
                      />
                    </StyledSelectionControl>
                  )}
                  <StyledHeaderLabel>
                    {column.icon}
                    {column.label}
                  </StyledHeaderLabel>
                </StyledCellContent>
              </StyledHeaderCell>
            ))}
            {hasRecordStatuses && (
              <StyledHeaderCell scope="col">
                <StyledCellContent>{t`Status`}</StyledCellContent>
              </StyledHeaderCell>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <StyledRecordRow key={record.id}>
              {columns.map((column, columnIndex) => {
                const cell = renderCell({
                  recordId: record.id,
                  columnId: column.id,
                  isReadOnly,
                });
                const hasPreviousValue =
                  cell.isChanged && isDefined(cell.previousValue);

                return (
                  <StyledCell key={column.id} isChanged={cell.isChanged}>
                    <StyledCellContent alignment={column.align}>
                      {columnIndex === 0 && (
                        <StyledSelectionControl>
                          <Checkbox
                            aria-label={t`Select ${record.label}`}
                            checked={selectedRecordIdSet.has(record.id)}
                            disabled={disabled}
                            onCheckedChange={(isSelected) =>
                              handleRecordSelectionChange({
                                recordId: record.id,
                                isSelected,
                              })
                            }
                          />
                        </StyledSelectionControl>
                      )}
                      <StyledValue>
                        {hasPreviousValue && (
                          <>
                            <VisuallyHidden>{t`Previous value:`}</VisuallyHidden>
                            <StyledPreviousValue>
                              {cell.previousValue}
                            </StyledPreviousValue>
                            <StyledChangeIcon aria-hidden="true">
                              <IconArrowRight
                                size={APPROVAL_REVIEW_CHANGE_ICON_SIZE}
                              />
                            </StyledChangeIcon>
                            <VisuallyHidden>{t`Proposed value:`}</VisuallyHidden>
                          </>
                        )}
                        {cell.value}
                      </StyledValue>
                    </StyledCellContent>
                  </StyledCell>
                );
              })}
              {hasRecordStatuses && (
                <StyledCell>
                  <StyledCellContent>
                    {isDefined(record.status) && (
                      <AiChatApprovalOutcome status={record.status} />
                    )}
                  </StyledCellContent>
                </StyledCell>
              )}
            </StyledRecordRow>
          ))}
          {!hasRecords && (
            <tr>
              <StyledEmptyCell
                colSpan={columns.length + Number(hasRecordStatuses)}
              >
                {t`No records to review`}
              </StyledEmptyCell>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </StyledTableViewport>
  );
};
