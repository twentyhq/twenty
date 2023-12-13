export type UUIDFilterValue = string;

export type IsFilter = 'NULL' | 'NOT_NULL';

export type UUIDFilter = {
  eq?: UUIDFilterValue;
  in?: UUIDFilterValue[];
  neq?: UUIDFilterValue;
  is?: IsFilter;
};

export type StringFilter = {
  eq?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  lt?: string;
  lte?: string;
  neq?: string;
  startsWith?: string;
  like?: string;
  ilike?: string;
  regex?: string;
  iregex?: string;
  is?: IsFilter;
};

export type FloatFilter = {
  eq?: number;
  gt?: number;
  gte?: number;
  in?: number[];
  lt?: number;
  lte?: number;
  neq?: number;
  is?: IsFilter;
};

export type DateFilter = {
  eq?: string;
  gt?: string;
  gte?: string;
  in?: string[];
  lt?: string;
  lte?: string;
  neq?: string;
  is?: IsFilter;
};

export type CurrencyFilter = {
  amountMicros?: FloatFilter;
};

export type URLFilter = {
  url?: StringFilter;
};

export type FullNameFilter = {
  firstName?: StringFilter;
  lastName?: StringFilter;
};

export type LeafFilter =
  | UUIDFilter
  | StringFilter
  | FloatFilter
  | DateFilter
  | CurrencyFilter
  | URLFilter
  | FullNameFilter;

export type ObjectRecordFilter =
  | {
      and?: ObjectRecordFilter[];
      or?: ObjectRecordFilter[];
      not?: ObjectRecordFilter;
    }
  | {
      [fieldName: string]: LeafFilter;
    };
