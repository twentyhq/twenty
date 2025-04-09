import { createContext, ReactElement } from 'react';

export type RecordTitleCellContextProps = {
  editModeContent?: ReactElement;
  editModeContentOnly?: boolean;
  displayModeContent?: ReactElement;
  loading?: boolean;
};

const defaultRecordTitleCellContextProp: RecordTitleCellContextProps = {
  editModeContent: undefined,
  editModeContentOnly: false,
  displayModeContent: undefined,
  loading: false,
};

export const RecordTitleCellContext =
  createContext<RecordTitleCellContextProps>(defaultRecordTitleCellContextProp);
