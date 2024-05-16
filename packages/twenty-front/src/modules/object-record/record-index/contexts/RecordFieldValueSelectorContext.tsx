import { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type RecordFiedValue = {
  [recordId: string]: {
    [fieldName: string]: any;
  };
};

export const RecordFieldValueSelectorContext = createContext<
  [RecordFiedValue, Dispatch<SetStateAction<RecordFiedValue>>]
>([{}, () => {}]);

export const useSetRecordValue = () => {
  const setTableValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[1],
  );

  return (
    recordId: string,
    newRecord: Dispatch<SetStateAction<RecordFiedValue['recordId']>>,
  ) => {
    setTableValue((currentTable) => ({
      ...currentTable,
      [recordId]: newRecord,
    }));
  };
};

export const useRecordValue = (recordId: string) => {
  const tableValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[0],
  );

  return tableValue[recordId];
};

export const useRecordFieldValue = (recordId: string, fieldName: string) => {
  const tableValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[0],
  );

  return tableValue[recordId][fieldName];
};

export const useSetRecordFieldValue = () => {
  const setTableValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[1],
  );

  return (recordId: string, fieldName: string, newValue: any) => {
    setTableValue((currentTable) => ({
      ...currentTable,
      [recordId]: {
        ...currentTable[recordId],
        [fieldName]: newValue,
      },
    }));
  };
};

export const RecordFieldValueSelectorContextProvider = ({
  children,
}: {
  children: any;
}) => (
  <RecordFieldValueSelectorContext.Provider
    value={useState<RecordFiedValue>({})}
  >
    {children}
  </RecordFieldValueSelectorContext.Provider>
);
