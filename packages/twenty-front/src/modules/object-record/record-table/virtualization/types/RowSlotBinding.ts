export type RowSlotBinding =
  | { type: 'record'; recordId: string }
  | { type: 'skeleton'; rowIndex: number };
