import { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type RecordFieldValue = {
  [recordId: string]: {
    [fieldName: string]: any;
  };
};

export const RecordFieldValueSelectorContext = createContext<
  [RecordFieldValue, Dispatch<SetStateAction<RecordFieldValue>>]
>([{}, () => {}]);

export const useSetRecordValue = () => {
  const setTableValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[1],
  );

  return (recordId: string, newRecord: any) => {
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

  return tableValue?.[recordId];
};

export const useRecordFieldValue = (recordId: string, fieldName: string) => {
  const recordFieldValues = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[0],
  );

  return recordFieldValues?.[recordId]?.[fieldName];
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
    value={useState<RecordFieldValue>({})}
  >
    {children}
  </RecordFieldValueSelectorContext.Provider>
);
