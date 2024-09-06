import { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';

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
    (value) => value[0]?.[recordId],
  );

  return tableValue as ObjectRecord | undefined;
};

export const useRecordFieldValue = <T,>(
  recordId: string,
  fieldName: string,
) => {
  const recordFieldValue = useContextSelector(
    RecordFieldValueSelectorContext,
    (value) => value[0]?.[recordId]?.[fieldName],
  );

  return recordFieldValue as T | undefined;
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
