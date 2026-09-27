import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
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
  type SpreadsheetImportServerRowsPage,
} from '@/spreadsheet-import/types/SpreadsheetImportServerAdapter';
import { filterImportedColumns } from '@/spreadsheet-import/utils/filterImportedColumns';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo, useState } from 'react';
import { type SpreadsheetColumns } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

export const SERVER_REVIEW_PAGE_SIZE = 100;

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
// holds the whole file.
export const ServerReviewStep = ({
  serverImport,
  importedColumns,
  rowCount,
  errorRowCount,
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

  const columns = useMemo(
    () => filterImportedColumns(generateColumns(fields), importedColumns),
    [fields, importedColumns],
  );

  const loadPage = async (nextOffset: number, nextOnlyErrors: boolean) => {
    setIsLoading(true);
    try {
      setPage(
        await serverImport.loadRows({
          offset: nextOffset,
          limit: SERVER_REVIEW_PAGE_SIZE,
          onlyErrors: nextOnlyErrors,
        }),
      );
      setOffset(nextOffset);
      setOnlyErrors(nextOnlyErrors);
    } catch (error) {
      onError((error as Error).message);
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
      onError((error as Error).message);
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
                disabled={isLoading}
                onCheckedChange={() => loadPage(0, !onlyErrors)}
                size="sm"
              />
              <StyledToolbarText>
                <Trans>Show only rows with errors</Trans>
              </StyledToolbarText>
            </StyledToolbarGroup>
            <StyledToolbarGroup>
              <StyledToolbarText>
                {t`${formattedFirstRowPosition}–${formattedLastRowPosition} of ${formattedTotalCount}`}
              </StyledToolbarText>
              <Button
                aria-label={t`Previous page`}
                startIcon={<IconChevronLeft />}
                disabled={isLoading || offset === 0}
                onClick={() =>
                  loadPage(
                    Math.max(0, offset - SERVER_REVIEW_PAGE_SIZE),
                    onlyErrors,
                  )
                }
              />
              <Button
                aria-label={t`Next page`}
                startIcon={<IconChevronRight />}
                disabled={isLoading || lastRowPosition >= page.totalCount}
                onClick={() =>
                  loadPage(offset + SERVER_REVIEW_PAGE_SIZE, onlyErrors)
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
      />
    </>
  );
};
