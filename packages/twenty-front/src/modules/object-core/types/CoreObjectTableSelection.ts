export type CoreObjectTableSelection<TItem> = {
  selectedRowIds: string[];
  onToggleRow: (rowId: string) => void;
  onToggleAllRows: (nextSelectedRowIds: string[]) => void;
  isItemSelectable?: (item: TItem) => boolean;
};
