export type ShahryarRecordApiSection = {
  path: string;
  canCreate?: boolean;
  rows: string[][];
};

export type ShahryarCreateRecordRequest = {
  path: string;
  values: Record<string, string>;
};

export type ShahryarCreateRecordResponse = {
  path: string;
  row: string[];
  createdAt: string;
};
