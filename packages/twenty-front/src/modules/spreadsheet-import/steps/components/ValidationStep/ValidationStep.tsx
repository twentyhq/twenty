import { Heading } from '@/spreadsheet-import/components/Heading';
import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { StepNavigationButton } from '@/spreadsheet-import/components/StepNavigationButton';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import {
  ColumnType,
  Columns,
} from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import {
  ImportValidationResult,
  ImportedStructuredRow,
} from '@/spreadsheet-import/types';
import { addErrorsAndRunHooks } from '@/spreadsheet-import/utils/dataMutations';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
// @ts-expect-error Todo: remove usage of react-data-grid`
import { RowsChangeData } from 'react-data-grid';
import { Button, IconTrash, Toggle } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { generateColumns } from './components/columns';
import { ImportedStructuredRowMetadata } from './types';

const StyledContent = styled(Modal.Content)`
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
`;

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const StyledErrorToggle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledErrorToggleDescription = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
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

type ValidationStepProps<T extends string> = {
  initialData: ImportedStructuredRow<T>[];
  importedColumns: Columns<string>;
  file: File;
  onBack: () => void;
  setCurrentStepState: Dispatch<SetStateAction<SpreadsheetImportStep>>;
};

export const ValidationStep = <T extends string>({
  initialData,
  importedColumns,
  file,
  setCurrentStepState,
  onBack,
}: ValidationStepProps<T>) => {
  const { enqueueDialog } = useDialogManager();
  const { fields, onClose, onSubmit, rowHook, tableHook } =
    useSpreadsheetImportInternal<T>();

  const [data, setData] = useState<
    (ImportedStructuredRow<T> & ImportedStructuredRowMetadata)[]
  >(
    useMemo(
      () => addErrorsAndRunHooks<T>(initialData, fields, rowHook, tableHook),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    ),
  );
  const [selectedRows, setSelectedRows] = useState<
    ReadonlySet<number | string>
  >(new Set());
  const [filterByErrors, setFilterByErrors] = useState(false);
  const [showUnmatchedColumns, setShowUnmatchedColumns] = useState(false);

  const updateData = useCallback(
    (rows: typeof data) => {
      setData(addErrorsAndRunHooks<T>(rows, fields, rowHook, tableHook));
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
                (importColumn.type === ColumnType.matched &&
                  importColumn.value === column.key) ||
                (importColumn.type === ColumnType.matchedSelect &&
                  importColumn.value === column.key) ||
                (importColumn.type === ColumnType.matchedSelectOptions &&
                  importColumn.value === column.key) ||
                (importColumn.type === ColumnType.matchedCheckbox &&
                  importColumn.value === column.key) ||
                column.key === 'select-row',
            ).length > 0;

          if (!hasBeenImported && !showUnmatchedColumns) return null;
          return column;
        })
        .filter(Boolean),
    [fields, importedColumns, showUnmatchedColumns],
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
    (row: ImportedStructuredRow<T> & ImportedStructuredRowMetadata) =>
      row.__index,
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
                values as unknown as ImportedStructuredRow<T>,
              );
              return acc;
            }
          }
        }
        acc.validStructuredRows.push(
          values as unknown as ImportedStructuredRow<T>,
        );
        return acc;
      },
      {
        validStructuredRows: [] as ImportedStructuredRow<T>[],
        invalidStructuredRows: [] as ImportedStructuredRow<T>[],
        allStructuredRows: data,
      } satisfies ImportValidationResult<T>,
    );

    setCurrentStepState({
      type: SpreadsheetImportStepType.loading,
    });

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
        title: 'Finish flow with errors',
        message:
          'There are still some rows that contain errors. Rows with errors will be ignored when submitting.',
        buttons: [
          { title: 'Cancel' },
          {
            title: 'Submit',
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
        <Heading
          title="Review your import"
          description="Correct the issues and fill the missing data."
        />
        <StyledToolbar>
          <StyledErrorToggle>
            <Toggle
              value={filterByErrors}
              onChange={() => setFilterByErrors(!filterByErrors)}
            />
            <StyledErrorToggleDescription>
              Show only rows with errors
            </StyledErrorToggleDescription>
          </StyledErrorToggle>
          <StyledErrorToggle>
            <Toggle
              value={showUnmatchedColumns}
              onChange={() => setShowUnmatchedColumns(!showUnmatchedColumns)}
            />
            <StyledErrorToggleDescription>
              Show unmatched columns
            </StyledErrorToggleDescription>
          </StyledErrorToggle>
          <Button
            Icon={IconTrash}
            title="Remove"
            accent="danger"
            onClick={deleteSelectedRows}
            disabled={selectedRows.size === 0}
          />
        </StyledToolbar>
        <StyledScrollContainer>
          <SpreadsheetImportTable
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
                    ? 'No data containing errors'
                    : 'No data found'}
                </StyledNoRowsContainer>
              ),
            }}
          />
        </StyledScrollContainer>
      </StyledContent>
      <StepNavigationButton
        onClick={onContinue}
        onBack={onBack}
        title="Confirm"
      />
    </>
  );
};
