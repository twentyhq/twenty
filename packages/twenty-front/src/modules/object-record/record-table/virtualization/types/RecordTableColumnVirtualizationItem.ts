export type RecordTableColumnVirtualizationItem =
  | {
      type: 'column';
      columnIndex: number;
    }
  | {
      type: 'spacer';
      firstColumnIndex: number;
      width: number;
    };
