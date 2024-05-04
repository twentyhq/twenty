import { Dispatch, SetStateAction, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type SelectedRows = {
  [recordId: string]: boolean;
};

export const SelectedRowsSelectorContext = createContext<
  [SelectedRows, Dispatch<SetStateAction<SelectedRows>>]
>([{}, () => {}]);

export const useSetSelectedRow = () => {
  const setSelectedRow = useContextSelector(
    SelectedRowsSelectorContext,
    (value) => value[1],
  );

  return (recordId: string, newSelectedValue: boolean) => {
    setSelectedRow((currentSelectedRows) => ({
      ...currentSelectedRows,
      [recordId]: newSelectedValue,
    }));
  };
};

export const useSelectedRow = (recordId: string) => {
  const selectedRow = useContextSelector(
    SelectedRowsSelectorContext,
    (value) => value[0],
  );

  return selectedRow[recordId];
};

export const SelectedRowsSelectorContextProvider = ({
  children,
}: {
  children: any;
}) => (
  <SelectedRowsSelectorContext.Provider value={useState<SelectedRows>({})}>
    {children}
  </SelectedRowsSelectorContext.Provider>
);
