import { createContext } from 'react';

export type RecordTableColumnAggregateFooterCellValue = {
  viewFieldId: string;
  fieldMetadataId: string;
};

export const RecordTableColumnAggregateFooterCellContext =
  createContext<RecordTableColumnAggregateFooterCellValue>(
    {} as RecordTableColumnAggregateFooterCellValue,
  );
