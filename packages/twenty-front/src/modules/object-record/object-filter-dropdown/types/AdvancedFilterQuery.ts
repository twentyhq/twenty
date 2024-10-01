import { Filter } from '../../object-filter-dropdown/types/Filter';

export type AdvancedFilterQueryAnd = {
  and: AdvancedFilterQuery[];
};

export type AdvancedFilterQueryOr = {
  or: AdvancedFilterQuery[];
};

export type AdvancedFilterQueryNot = {
  not: AdvancedFilterQuery;
};

export type AdvancedFilterQuerySubFilter = Pick<
  Filter,
  'value' | 'operand' | 'fieldMetadataId'
> & {
  definition: {
    type: Filter['definition']['type'];
  };
};

export type AdvancedFilterQuery =
  | AdvancedFilterQueryAnd
  | AdvancedFilterQueryOr
  | AdvancedFilterQueryNot
  | AdvancedFilterQuerySubFilter;
