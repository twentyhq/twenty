export type FilterOperator = {
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  eq?: any;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  ne?: any;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  like?: string;
  ilike?: string;
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  in?: any[];
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  is?: 'NULL' | any;
};
