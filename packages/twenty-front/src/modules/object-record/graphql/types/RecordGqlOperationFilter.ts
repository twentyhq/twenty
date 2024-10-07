export type UUIDFilterValue = string;

export type IsFilter = 'NULL' | 'NOT_NULL';

export type UUIDFilter = {
  eq?: UUIDFilterValue;
  in?: UUIDFilterValue[];
  neq?: UUIDFilterValue;
  is?: IsFilter;
};

export type RelationFilter = {
  is?: IsFilter;
  in?: UUIDFilterValue[];
};

export type BooleanFilter = {
  eq?: boolean;
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

/**
 * Always use a DateFilter in the variables of a query, and never directly in the query.
 *
 * Because pg_graphql only works with ISO strings if it is passed to variables.
 */
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
  label?: StringFilter;
};

export type FullNameFilter = {
  firstName?: StringFilter;
  lastName?: StringFilter;
};

export type AddressFilter = {
  addressStreet1?: StringFilter;
  addressStreet2?: StringFilter;
  addressCity?: StringFilter;
  addressState?: StringFilter;
  addressCountry?: StringFilter;
  addressPostcode?: StringFilter;
};

export type LinksFilter = {
  primaryLinkUrl?: StringFilter;
  primaryLinkLabel?: StringFilter;
};

export type ActorFilter = {
  name?: StringFilter;
  source?: IsFilter;
};

export type EmailsFilter = {
  primaryEmail?: StringFilter;
};

export type PhonesFilter = {
  primaryPhoneNumber?: StringFilter;
  primaryPhoneCountryCode?: StringFilter;
};

export type LeafFilter =
  | UUIDFilter
  | StringFilter
  | FloatFilter
  | DateFilter
  | CurrencyFilter
  | URLFilter
  | FullNameFilter
  | BooleanFilter
  | AddressFilter
  | LinksFilter
  | ActorFilter
  | PhonesFilter
  | undefined;

export type AndObjectRecordFilter = {
  and?: RecordGqlOperationFilter[];
};

export type OrObjectRecordFilter = {
  or?: RecordGqlOperationFilter[] | RecordGqlOperationFilter;
};

export type NotObjectRecordFilter = {
  not?: RecordGqlOperationFilter;
};

export type LeafObjectRecordFilter = {
  [fieldName: string]: LeafFilter;
};

export type RecordGqlOperationFilter =
  | LeafObjectRecordFilter
  | AndObjectRecordFilter
  | OrObjectRecordFilter
  | NotObjectRecordFilter;
