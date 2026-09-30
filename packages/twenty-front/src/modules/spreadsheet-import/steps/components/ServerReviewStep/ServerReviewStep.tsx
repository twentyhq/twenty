import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { SPREADSHEET_IMPORT_SERVER_REVIEW_PAGE_SIZE } from '@/spreadsheet-import/constants/SpreadsheetImportServerReviewPageSize';
import { SPREADSHEET_IMPORT_UNSAVED_ROW_CLASS_NAME } from '@/spreadsheet-import/constants/SpreadsheetImportUnsavedRowClassName';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useHideStepBar } from '@/spreadsheet-import/hooks/useHideStepBar';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { generateColumns } from '@/spreadsheet-import/steps/components/ValidationStep/components/columns';
import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { type ImportedStructuredRow } from '@/spreadsheet-import/types';
import {
  type SpreadsheetImportServerAdapter,
  type SpreadsheetImportServerRowEdit,
  type SpreadsheetImportServerRowsPage,
} from '@/spreadsheet-import/types/SpreadsheetImportServerAdapter';
import { filterImportedColumns } from '@/spreadsheet-import/utils/filterImportedColumns';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { type RowsChangeData } from 'react-data-grid';
import { isDefined, type SpreadsheetColumns } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight, IconTrash } from 'twenty-ui/icon';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContentWrapper = styled.div`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  position: relative;
`;

const StyledScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
  overflow: auto;
  width: 100%;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledToolbarGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToolbarText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledNoRowsContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  grid-column: 1/-1;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[8]};
`;

type SaveStatus = 'idle' | 'saving' | 'failed';

type ServerReviewStepProps = {
  serverImport: SpreadsheetImportServerAdapter;
  importedColumns: SpreadsheetColumns;
  rowCount: number;
  errorRowCount: number;
  initialPage: SpreadsheetImportServerRowsPage;
  onBack: () => void;
  onError: (message: string) => void;
  setCurrentStepState: (currentStepState: SpreadsheetImportStep) => void;
};

// Reviews rows the server validated, one page at a time: the browser never
// holds the whole file. Edits and deletions are saved to the server, which
// checks every row again before the import can start.
export const ServerReviewStep = ({
  serverImport,
  importedColumns,
  rowCount: initialRowCount,
  errorRowCount: initialErrorRowCount,
  initialPage,
  onBack,
  onError,
  setCurrentStepState,
}: ServerReviewStepProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { enqueueDialog } = useDialogManager();
  const hideStepBar = useHideStepBar();
  const { spreadsheetImportFields: fields, onClose } =
    useSpreadsheetImportInternal();

  const [page, setPage] = useState(initialPage);
  const [offset, setOffset] = useState(0);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState({
    rowCount: initialRowCount,
    errorRowCount: initialErrorRowCount,
  });
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [unsavedRowNumbers, setUnsavedRowNumbers] = useState<
    ReadonlySet<number>
  >(new Set());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { rowCount, errorRowCount } = counts;

  const columns = useMemo(
    () => filterImportedColumns(generateColumns(fields), importedColumns),
    [fields, importedColumns],
  );

  const saveEdits = async (edits: SpreadsheetImportServerRowEdit[]) => {
    setUnsavedRowNumbers(
      (current) =>
        new Set([...current, ...edits.map(({ rowNumber }) => rowNumber)]),
    );
    setSaveStatus('saving');

    try {
      const { rejectedEditsErrorMessage, ...savedCounts } =
        await serverImport.saveEdits(edits);
      const unsavedEdits = serverImport.getUnsavedEdits();

      if (isDefined(rejectedEditsErrorMessage)) {
        onError(rejectedEditsErrorMessage);
      }

      setCounts(savedCounts);
      setUnsavedRowNumbers(
        new Set(unsavedEdits.map(({ rowNumber }) => rowNumber)),
      );

      if (unsavedEdits.length === 0) {
        setSaveStatus('idle');
        await loadPage(offset, onlyErrors);
      }
    } catch (error) {
      setSaveStatus('failed');
      onError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleRowsChange = (
    rows: (ImportedStructuredRow & ImportedStructuredRowMetadata)[],
    {
      indexes,
    }: RowsChangeData<ImportedStructuredRow & ImportedStructuredRowMetadata>,
  ) => {
    saveEdits(
      indexes.map((index) => {
        const row = rows[index];
        const previousRow = page.rows[index];
        const values: Record<string, string | boolean | null> = {};

        for (const [fieldKey, value] of Object.entries(row)) {
          if (
            fieldKey.startsWith('__') ||
            typeof value === 'object' ||
            value === previousRow?.[fieldKey]
          ) {
            continue;
          }
          values[fieldKey] = value ?? null;
        }

        return { rowNumber: Number(row.__index), values };
      }),
    );
    setPage({ ...page, rows });
  };

  const deleteSelectedRows = () => {
    saveEdits(
      [...selectedRows].map((rowIndex) => ({
        rowNumber: Number(rowIndex),
        isDeleted: true,
      })),
    );
    setPage({
      totalCount: page.totalCount - selectedRows.size,
      rows: page.rows.filter((row) => !selectedRows.has(row.__index)),
    });
    setSelectedRows(new Set());
  };

  const loadPage = async (nextOffset: number, nextOnlyErrors: boolean) => {
    setIsLoading(true);
    try {
      const nextPage = await serverImport.loadRows({
        offset: nextOffset,
        limit: SPREADSHEET_IMPORT_SERVER_REVIEW_PAGE_SIZE,
        onlyErrors: nextOnlyErrors,
      });

      const unsavedEditByRowNumber = new Map(
        serverImport.getUnsavedEdits().map((edit) => [edit.rowNumber, edit]),
      );

      // Edits still waiting to be saved stay visible over the saved rows
      const rows = nextPage.rows
        .filter(
          (row) =>
            unsavedEditByRowNumber.get(Number(row.__index))?.isDeleted !== true,
        )
        .map((row) => ({
          ...row,
          ...unsavedEditByRowNumber.get(Number(row.__index))?.values,
        })) as typeof nextPage.rows;
      const rowKeys = new Set(rows.map((row) => row.__index));

      setPage({ ...nextPage, rows });
      // Remove only acts on selected rows the user can see
      setSelectedRows(
        (current) => new Set([...current].filter((key) => rowKeys.has(key))),
      );
      setOffset(nextOffset);
      setOnlyErrors(nextOnlyErrors);
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const rowKeyGetter = useCallback(
    (row: ImportedStructuredRow & ImportedStructuredRowMetadata) => row.__index,
    [],
  );

  const startImport = async () => {
    setCurrentStepState({
      type: SpreadsheetImportStepType.importData,
      recordsToImportCount: rowCount - errorRowCount,
    });
    hideStepBar();
    try {
      await serverImport.importRows();
      onClose();
    } catch (error) {
      onError(error instanceof Error ? error.message : String(error));
      setCurrentStepState({
        type: SpreadsheetImportStepType.reviewServerRows,
        importedColumns,
        rowCount,
        errorRowCount,
        initialPage: page,
      });
    }
  };

  const handleContinue = () => {
    if (errorRowCount === 0) {
      startImport();
      return;
    }

    const formattedErrorRowCount = formatNumber(errorRowCount);

    enqueueDialog({
      title: t`Finish flow with errors`,
      message: t`${formattedErrorRowCount} rows contain errors and will be skipped. A report of the skipped rows will be available once the import finishes.`,
      buttons: [
        { title: t`Cancel` },
        {
          title: t`Submit`,
          variant: 'outline',
          onClick: startImport,
          role: 'confirm',
        },
      ],
    });
  };

  // Saving reloads the page it started on, so paging waits for it
  const isPagingDisabled = isLoading || saveStatus === 'saving';
  const firstRowPosition = page.totalCount === 0 ? 0 : offset + 1;
  const lastRowPosition = offset + page.rows.length;
  const formattedFirstRowPosition = formatNumber(firstRowPosition);
  const formattedLastRowPosition = formatNumber(lastRowPosition);
  const formattedTotalCount = formatNumber(page.totalCount);

  return (
    <>
      <Dialog.Body
        style={{
          display: 'flex',
          flex: '1 1 0%',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <StyledContentWrapper>
          <StyledScrollContainer>
            {page.rows.length === 0 && (
              // The table renders nothing without rows, fallback included
              <StyledNoRowsContainer>
                {onlyErrors ? t`No rows with errors` : t`No data found`}
              </StyledNoRowsContainer>
            )}
            <SpreadsheetImportTable
              headerRowHeight={32}
              rowKeyGetter={rowKeyGetter}
              rows={page.rows}
              columns={columns}
              onRowsChange={handleRowsChange}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              rowClass={(row) =>
                unsavedRowNumbers.has(Number(row.__index))
                  ? SPREADSHEET_IMPORT_UNSAVED_ROW_CLASS_NAME
                  : undefined
              }
              renderers={{
                noRowsFallback: (
                  <StyledNoRowsContainer>
                    {onlyErrors ? t`No rows with errors` : t`No data found`}
                  </StyledNoRowsContainer>
                ),
              }}
            />
          </StyledScrollContainer>
          <StyledToolbar>
            <StyledToolbarGroup>
              <Switch
                aria-label={t`Show only rows with errors`}
                checked={onlyErrors}
                disabled={isPagingDisabled}
                onCheckedChange={() => loadPage(0, !onlyErrors)}
                size="sm"
              />
              <StyledToolbarText>
                <Trans>Show only rows with errors</Trans>
              </StyledToolbarText>
              <Button
                startIcon={<IconTrash />}
                onClick={deleteSelectedRows}
                disabled={selectedRows.size === 0}
              >{t`Remove`}</Button>
            </StyledToolbarGroup>
            {saveStatus === 'saving' && (
              <StyledToolbarText>{t`Saving changes…`}</StyledToolbarText>
            )}
            {saveStatus === 'failed' && (
              <StyledToolbarGroup>
                <StyledToolbarText>{t`Changes not saved`}</StyledToolbarText>
                <Button onClick={() => saveEdits([])}>{t`Retry`}</Button>
              </StyledToolbarGroup>
            )}
            <StyledToolbarGroup>
              <StyledToolbarText>
                {t`${formattedFirstRowPosition}–${formattedLastRowPosition} of ${formattedTotalCount}`}
              </StyledToolbarText>
              <Button
                aria-label={t`Previous page`}
                startIcon={<IconChevronLeft />}
                disabled={isPagingDisabled || offset === 0}
                onClick={() =>
                  loadPage(
                    Math.max(
                      0,
                      offset - SPREADSHEET_IMPORT_SERVER_REVIEW_PAGE_SIZE,
                    ),
                    onlyErrors,
                  )
                }
              />
              <Button
                aria-label={t`Next page`}
                startIcon={<IconChevronRight />}
                disabled={
                  isPagingDisabled || lastRowPosition >= page.totalCount
                }
                onClick={() =>
                  loadPage(
                    offset + SPREADSHEET_IMPORT_SERVER_REVIEW_PAGE_SIZE,
                    onlyErrors,
                  )
                }
              />
            </StyledToolbarGroup>
          </StyledToolbar>
        </StyledContentWrapper>
      </Dialog.Body>
      <StepNavigationButton
        onContinue={handleContinue}
        onBack={onBack}
        continueTitle={t`Confirm`}
        // The import must read exactly the rows shown
        isContinueDisabled={saveStatus !== 'idle' || unsavedRowNumbers.size > 0}
      />
    </>
  );
};
