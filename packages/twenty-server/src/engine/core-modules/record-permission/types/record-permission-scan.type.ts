export type RecordPermissionScan = {
  blockCursor: number;
  tupleCursor?: number;
  blockLimit: number | null;
  relationFileNode: number | null;
};
