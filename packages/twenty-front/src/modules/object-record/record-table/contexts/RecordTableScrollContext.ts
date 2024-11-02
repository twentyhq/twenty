import { createContext, Dispatch, SetStateAction } from 'react';

export type RecordTableScrollContextProps = {
  enableXScroll: boolean;
  setEnableXScroll: Dispatch<SetStateAction<boolean>>;
  enableYScroll: boolean;
  setEnableYScroll: Dispatch<SetStateAction<boolean>>;
};

export const RecordTableScrollContext =
  createContext<RecordTableScrollContextProps>(
    {} as RecordTableScrollContextProps,
  );
