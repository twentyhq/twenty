import { ReactNode } from 'react';
import { SearchConfigType, SearchableType } from '../search/interface';
import { Person } from '../entities/person.interface';
import { Company } from '../entities/company.interface';
import { User } from '../entities/user.interface';
import { AnyEntity, BoolExpType } from '../entities/generic.interface';

export type FilterableFieldsType = Person | Company;
export type FilterWhereType = Person | Company | User | AnyEntity;

export type FilterConfigType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = any,
> = {
  key: string;
  label: string;
  icon: ReactNode;
  operands: FilterOperandType<FilteredType, WhereType>[];
  searchConfig: WhereType extends SearchableType
    ? SearchConfigType<WhereType>
    : null;
  selectedValueRender: (selected: WhereType) => string;
};

export type FilterOperandType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = AnyEntity,
> =
  | FilterOperandExactMatchType<FilteredType, WhereType>
  | FilterOperandComparativeType<FilteredType, WhereType>;

type FilterOperandExactMatchType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType,
> = {
  label: 'Equal' | 'Not equal';
  id: 'equal' | 'not-equal';
  whereTemplate: (value: WhereType) => BoolExpType<FilteredType>;
};

type FilterOperandComparativeType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType,
> = {
  label: 'Like' | 'Not like' | 'Include';
  id: 'like' | 'not_like' | 'include';
  whereTemplate: (value: WhereType) => BoolExpType<FilteredType>;
};

export type SelectedFilterType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = AnyEntity,
> = {
  key: string;
  value: WhereType;
  displayValue: string;
  label: string;
  icon: ReactNode;
  operand: FilterOperandType<FilteredType, WhereType>;
};
