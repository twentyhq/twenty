import { useCallback, useMemo, useState } from 'react';
import type { RowsChangeData } from 'react-data-grid';
import styled from '@emotion/styled';

import { ContinueButton } from '@/spreadsheet-import/components/ContinueButton';
import { Heading } from '@/spreadsheet-import/components/Heading';
import { Table } from '@/spreadsheet-import/components/Table';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import type { Data } from '@/spreadsheet-import/types';
import { addErrorsAndRunHooks } from '@/spreadsheet-import/utils/dataMutations';
import { Button } from '@/ui/button/components/Button';
import { useDialog } from '@/ui/dialog/hooks/useDialog';
import { IconTrash } from '@/ui/icon';
import { Toggle } from '@/ui/input/toggle/components/Toggle';
import { Modal } from '@/ui/modal/components/Modal';

import { generateColumns } from './components/columns';
import type { Meta } from './types';

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const ErrorToggle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const ErrorToggleDescription = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
  width: 100%;
`;

const NoRowsContainer = styled.div`
  display: flex;
  grid-column: 1/-1;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

type Props<T extends string> = {
  initialData: Data<T>[];
  file: File;
  onSubmitStart?: () => void;
};

export const ValidationStep = <T extends string>({
  initialData,
  file,
  onSubmitStart,
}: Props<T>) => {
  const { enqueueDialog } = useDialog();
  const { fields, onClose, onSubmit, rowHook, tableHook } =
    useSpreadsheetImportInternal<T>();

  const [data, setData] = useState<(Data<T> & Meta)[]>(
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

  const updateData = useCallback(
    (rows: typeof data) => {
      setData(addErrorsAndRunHooks<T>(rows, fields, rowHook, tableHook));
    },
    [setData, rowHook, tableHook, fields],
  );

  const deleteSelectedRows = () => {
    if (selectedRows.size) {
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
      const changes = changedData?.indexes.reduce((acc, index) => {
        // when data is filtered val !== actual index in data
        const realIndex = data.findIndex(
          (value) => value.__index === rows[index].__index,
        );
        acc[realIndex] = rows[index];
        return acc;
      }, {} as Record<number, (typeof data)[number]>);
      const newData = Object.assign([], data, changes);
      updateData(newData);
    },
    [data, updateData],
  );

  const columns = useMemo(() => generateColumns(fields), [fields]);

  const tableData = useMemo(() => {
    if (filterByErrors) {
      return data.filter((value) => {
        if (value?.__errors) {
          return Object.values(value.__errors)?.filter(
            (err) => err.level === 'error',
          ).length;
        }
        return false;
      });
    }
    return data;
  }, [data, filterByErrors]);

  const rowKeyGetter = useCallback((row: Data<T> & Meta) => row.__index, []);

  const submitData = async () => {
    const calculatedData = data.reduce(
      (acc, value) => {
        const { __index, __errors, ...values } = value;
        if (__errors) {
          for (const key in __errors) {
            if (__errors[key].level === 'error') {
              acc.invalidData.push(values as unknown as Data<T>);
              return acc;
            }
          }
        }
        acc.validData.push(values as unknown as Data<T>);
        return acc;
      },
      { validData: [] as Data<T>[], invalidData: [] as Data<T>[], all: data },
    );
    onSubmitStart?.();
    await onSubmit(calculatedData, file);
    onClose();
  };
  const onContinue = () => {
    const invalidData = data.find((value) => {
      if (value?.__errors) {
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
          },
        ],
      });
    }
  };

  return (
    <>
      <Modal.Content>
        <Heading
          title="Review your import"
          description="Correct the issues and fill the missing data."
        />
        <Toolbar>
          <ErrorToggle>
            <Toggle
              value={filterByErrors}
              onChange={() => setFilterByErrors(!filterByErrors)}
            />
            <ErrorToggleDescription>
              Show only rows with errors
            </ErrorToggleDescription>
          </ErrorToggle>
          <Button
            icon={<IconTrash />}
            title="Remove"
            accent="danger"
            onClick={deleteSelectedRows}
            disabled={selectedRows.size === 0}
          />
        </Toolbar>
        <ScrollContainer>
          <Table
            rowKeyGetter={rowKeyGetter}
            rows={tableData}
            onRowsChange={updateRow}
            columns={columns}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            components={{
              noRowsFallback: (
                <NoRowsContainer>
                  {filterByErrors
                    ? 'No data containing errors'
                    : 'No data found'}
                </NoRowsContainer>
              ),
            }}
          />
        </ScrollContainer>
      </Modal.Content>
      <ContinueButton onContinue={onContinue} title="Confirm" />
    </>
  );
};
