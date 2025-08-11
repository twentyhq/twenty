import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useHideStepBar } from '@/spreadsheet-import/hooks/useHideStepBar';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportImportValidationResult,
} from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { addErrorsAndRunHooks } from '@/spreadsheet-import/utils/dataMutations';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
// @ts-expect-error Todo: remove usage of react-data-grid`
import { type RowsChangeData } from 'react-data-grid';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { generateColumns } from './components/columns';
import { type ImportedStructuredRowMetadata } from './types';

const StyledContent = styled(Modal.Content)`
  padding: 0px;
  position: relative;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background-color: ${({ theme }) => theme.background.secondary};
  bottom: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 400px;
  padding: ${({ theme }) => theme.spacing(3)};
  z-index: 1;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
`;

const StyledButton = styled(Button)`
  height: 24px;
`;

const StyledErrorToggle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledErrorToggleDescription = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
  width: 100%;
`;

const StyledNoRowsContainer = styled.div`
  display: flex;
  grid-column: 1/-1;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledNoRowsWithErrorsContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  justify-content: center;
  margin: auto 0;
`;

type ValidationStepProps = {
  initialData: ImportedStructuredRow[];
  importedColumns: SpreadsheetColumns;
  file: File;
  onBack: () => void;
  setCurrentStepState: Dispatch<SetStateAction<SpreadsheetImportStep>>;
};

export const ValidationStep = ({
  initialData,
  importedColumns,
  file,
  setCurrentStepState,
  onBack,
}: ValidationStepProps) => {
  const hideStepBar = useHideStepBar();
  const { enqueueDialog } = useDialogManager();
  const {
    spreadsheetImportFields: fields,
    onClose,
    onSubmit,
    rowHook,
    tableHook,
  } = useSpreadsheetImportInternal();

  const [data, setData] = useState<
    (ImportedStructuredRow & ImportedStructuredRowMetadata)[]
  >(
    useMemo(
      () => addErrorsAndRunHooks(initialData, fields, rowHook, tableHook),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  );
  const [selectedRows, setSelectedRows] = useState<
    ReadonlySet<number | string>
  >(new Set());
  const [filterByErrors, setFilterByErrors] = useState(false);

  const updateData = useCallback(
    (rows: typeof data) => {
      setData(addErrorsAndRunHooks(rows, fields, rowHook, tableHook));
    },
    [setData, rowHook, tableHook, fields],
  );

  const deleteSelectedRows = () => {
    if (selectedRows.size > 0) {
      const newData = data.filter((value) => !selectedRows.has(value.__index));
      updateData(newData);
      setSelectedRows(new Set());
    }
  };

  const { t } = useLingui();

  const updateRow = useCallback(
    (
      rows: typeof data,
      changedData?: RowsChangeData<(typeof data)[number]>,
    ) => {
      const changes = changedData?.indexes.reduce(
        // Todo: remove usage of react-data-grid
        (acc: any, index: any) => {
          // when data is filtered val !== actual index in data
          const realIndex = data.findIndex(
            (value) => value.__index === rows[index].__index,
          );
          acc[realIndex] = rows[index];
          return acc;
        },
        {} as Record<number, (typeof data)[number]>,
      );
      const newData = Object.assign([], data, changes);
      updateData(newData);
    },
    [data, updateData],
  );

  const columns = useMemo(
    () =>
      generateColumns(fields)
        .map((column) => {
          const hasBeenImported =
            importedColumns.filter(
              (importColumn) =>
                (importColumn.type === SpreadsheetColumnType.matched &&
                  importColumn.value === column.key) ||
                (importColumn.type === SpreadsheetColumnType.matchedSelect &&
                  importColumn.value === column.key) ||
                (importColumn.type ===
                  SpreadsheetColumnType.matchedSelectOptions &&
                  importColumn.value === column.key) ||
                (importColumn.type === SpreadsheetColumnType.matchedCheckbox &&
                  importColumn.value === column.key) ||
                column.key === 'select-row',
            ).length > 0;

          if (!hasBeenImported) return null;
          return column;
        })
        .filter(Boolean),
    [fields, importedColumns],
  );

  const tableData = useMemo(() => {
    if (filterByErrors) {
      return data.filter((value) => {
        if (isDefined(value?.__errors)) {
          return Object.values(value.__errors)?.filter(
            (err) => err.level === 'error',
          ).length;
        }
        return false;
      });
    }
    return data;
  }, [data, filterByErrors]);

  const rowKeyGetter = useCallback(
    (row: ImportedStructuredRow & ImportedStructuredRowMetadata) => row.__index,
    [],
  );

  const submitData = async () => {
    const calculatedData = data.reduce(
      (acc, value) => {
        const { __index, __errors, ...values } = value;
        if (isDefined(__errors)) {
          for (const key in __errors) {
            if (__errors[key].level === 'error') {
              acc.invalidStructuredRows.push(
                values as unknown as ImportedStructuredRow,
              );
              return acc;
            }
          }
        }
        acc.validStructuredRows.push(
          values as unknown as ImportedStructuredRow,
        );
        return acc;
      },
      {
        validStructuredRows: [] as ImportedStructuredRow[],
        invalidStructuredRows: [] as ImportedStructuredRow[],
        allStructuredRows: data,
      } satisfies SpreadsheetImportImportValidationResult,
    );

    setCurrentStepState({
      type: SpreadsheetImportStepType.importData,
      recordsToImportCount: calculatedData.validStructuredRows.length,
    });
    hideStepBar();

    await onSubmit(calculatedData, file);
    onClose();
  };
  const onContinue = () => {
    const invalidData = data.find((value) => {
      if (isDefined(value?.__errors)) {
        return !!Object.values(value.__errors)?.filter(
          (err) => err.level === 'error',
        ).length;
      }
      return false;
    });
    if (!invalidData) {
      submitData();
    } else {
      enqueueDialog({
        title: t`Finish flow with errors`,
        message: t`There are still some rows that contain errors. Rows with errors will be ignored when submitting.`,
        buttons: [
          { title: t`Cancel` },
          {
            title: t`Submit`,
            variant: 'primary',
            onClick: submitData,
            role: 'confirm',
          },
        ],
      });
    }
  };

  return (
    <>
      <StyledContent>
        {filterByErrors && tableData.length === 0 ? (
          <StyledNoRowsWithErrorsContainer>
            <Trans>No rows with errors</Trans>
          </StyledNoRowsWithErrorsContainer>
        ) : (
          <StyledScrollContainer>
            <SpreadsheetImportTable
              headerRowHeight={32}
              rowKeyGetter={rowKeyGetter}
              rows={tableData}
              onRowsChange={updateRow}
              columns={columns}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows as any} // TODO: replace 'any'
              components={{
                noRowsFallback: (
                  <StyledNoRowsContainer>
                    {filterByErrors
                      ? t`No data containing errors`
                      : t`No data found`}
                  </StyledNoRowsContainer>
                ),
              }}
            />
          </StyledScrollContainer>
        )}
        <StyledToolbar>
          <StyledErrorToggle>
            <Toggle
              value={filterByErrors}
              onChange={() => setFilterByErrors(!filterByErrors)}
              toggleSize="small"
            />
            <StyledErrorToggleDescription>
              <Trans>Show only rows with errors</Trans>
            </StyledErrorToggleDescription>
          </StyledErrorToggle>
          <StyledButton
            Icon={IconTrash}
            title={t`Remove`}
            accent="default"
            onClick={deleteSelectedRows}
            disabled={selectedRows.size === 0}
          />
        </StyledToolbar>
      </StyledContent>
      <StepNavigationButton
        onContinue={onContinue}
        onBack={onBack}
        continueTitle={t`Confirm`}
      />
    </>
  );
};
