import { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export type TableCellValue = {
  value: any;
  isEmpty: boolean;
};

export type TableCellStatus = {
  isInEditMode: boolean;
  hasSoftFocus: boolean;
};

export type TableCellValueByRecordFieldName = {
  [recordIdFieldNameKey: `${string}:${string}`]: TableCellValue | undefined;
};

export type TableCellStatusByPosition = {
  [positionRowColumnKey: `${number}-${number}`]: TableCellStatus | undefined;
};

export const TableCellValueByRecordFieldNameSelectorContext = createContext<
  [
    TableCellValueByRecordFieldName,
    Dispatch<SetStateAction<TableCellValueByRecordFieldName>>,
  ]
>([{}, () => {}]);

export const TableCellStatusByPositionSelectorContext = createContext<
  [
    TableCellStatusByPosition,
    Dispatch<SetStateAction<TableCellStatusByPosition>>,
  ]
>([{}, () => {}]);

export const useTableCellValueByRecordFieldName = ({
  recordId,
  fieldName,
}: {
  recordId: string;
  fieldName: string;
}) => {
  const tableCellValue = useContextSelector(
    TableCellValueByRecordFieldNameSelectorContext,
    (value) => value[0][`${recordId}:${fieldName}`],
  );

  const setTableCellValue = useContextSelector(
    TableCellValueByRecordFieldNameSelectorContext,
    (value) => value[1],
  );

  const setTableCellValueDirectly = (newTableCellStatus: TableCellValue) => {
    setTableCellValue((currentTableStatus) => ({
      ...currentTableStatus,
      [`${recordId}:${fieldName}`]: newTableCellStatus,
    }));
  };

  return {
    tableCellValue,
    setTableCellValue: setTableCellValueDirectly,
  };
};

export const useTableCellStatusByCellPosition = ({
  column,
  row,
}: TableCellPosition) => {
  const tableCellStatus = useContextSelector(
    TableCellStatusByPositionSelectorContext,
    (value) => value[0][`${row}-${column}`],
  );

  const setTableCellStatus = useContextSelector(
    TableCellStatusByPositionSelectorContext,
    (value) => value[1],
  );

  const setTableCellStatusDirectly = (newTableCellStatus: TableCellStatus) => {
    setTableCellStatus((currentTableStatus) => ({
      ...currentTableStatus,
      [`${row}-${column}`]: newTableCellStatus,
    }));
  };

  return {
    tableCellStatus,
    setTableCellStatus: setTableCellStatusDirectly,
  };
};

export const useSetTableCellStatus = () => {
  const setTableCellStatus = useContextSelector(
    TableCellStatusByPositionSelectorContext,
    (value) => value[1],
  );

  return (
    row: number,
    column: number,
    newTableCellStatus: Dispatch<SetStateAction<TableCellStatus | undefined>>,
  ) => {
    setTableCellStatus((currentTableStatus) => ({
      ...currentTableStatus,
      [`${row}-${column}`]: newTableCellStatus(
        currentTableStatus[`${row}-${column}`],
      ),
    }));
  };
};

export const useSetTableCellValue = () => {
  const setTableCellValue = useContextSelector(
    TableCellValueByRecordFieldNameSelectorContext,
    (value) => value[1],
  );

  return (
    recordId: string,
    fieldName: string,
    newTableCellValue: Dispatch<SetStateAction<TableCellValue>>,
  ) => {
    setTableCellValue((currentTableCellValue) => ({
      ...currentTableCellValue,
      [`${recordId}:${fieldName}`]: newTableCellValue,
    }));
  };
};

export const TableCellSelectorContextProvider = ({
  children,
}: {
  children: any;
}) => (
  <TableCellValueByRecordFieldNameSelectorContext.Provider
    value={useState<TableCellValueByRecordFieldName>({})}
  >
    <TableCellStatusByPositionSelectorContext.Provider
      value={useState<TableCellStatusByPosition>({})}
    >
      {children}
    </TableCellStatusByPositionSelectorContext.Provider>
  </TableCellValueByRecordFieldNameSelectorContext.Provider>
);
