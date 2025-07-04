import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { createContext, ReactElement } from 'react';

export type RecordTitleCellContextProps = {
  editModeContent?: ReactElement;
  editModeContentOnly?: boolean;
  displayModeContent?: ReactElement;
  loading?: boolean;
  isReadOnly?: boolean;
  containerType: RecordTitleCellContainerType;
};

export const RecordTitleCellContext =
  createContext<RecordTitleCellContextProps>({} as RecordTitleCellContextProps);
