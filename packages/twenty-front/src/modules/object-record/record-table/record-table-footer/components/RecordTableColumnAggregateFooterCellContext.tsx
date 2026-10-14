import { createContext } from 'react';

export type RecordTableColumnAggregateFooterCellValue = {
  viewFieldId: string;
  recordFieldKey: string;
  fieldMetadataId: string;
};

export const RecordTableColumnAggregateFooterCellContext =
  createContext<RecordTableColumnAggregateFooterCellValue>(
    {} as RecordTableColumnAggregateFooterCellValue,
  );
