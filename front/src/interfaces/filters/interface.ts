import { ReactNode } from 'react';
import { SearchConfigType } from '../search/interface';
import {
  AnyEntity,
  BoolExpType,
  UnknownType,
} from '../entities/generic.interface';

export type FilterableFieldsType = AnyEntity;
export type FilterWhereRelationType = AnyEntity;
export type FilterWhereType = FilterWhereRelationType | string | UnknownType;

export type FilterConfigType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = UnknownType,
> = {
  key: string;
  label: string;
  icon: ReactNode;
  type: WhereType extends UnknownType
    ? 'relation' | 'text' | 'date'
    : WhereType extends AnyEntity
    ? 'relation'
    : WhereType extends string
    ? 'text' | 'date'
    : never;
  operands: FilterOperandType<FilteredType, WhereType>[];
} & (WhereType extends UnknownType
  ? { searchConfig?: SearchConfigType<UnknownType> }
  : WhereType extends AnyEntity
  ? { searchConfig: SearchConfigType<WhereType> }
  : WhereType extends string
  ? object
  : never) &
  (WhereType extends UnknownType
    ? { selectedValueRender?: (selected: any) => string }
    : WhereType extends AnyEntity
    ? { selectedValueRender: (selected: WhereType) => string }
    : WhereType extends string
    ? object
    : never);

export type FilterOperandType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = UnknownType,
> = WhereType extends UnknownType
  ? any
  : WhereType extends FilterWhereRelationType
  ? FilterOperandRelationType<FilteredType, WhereType>
  : WhereType extends string
  ? FilterOperandFieldType<FilteredType>
  : never;

type FilterOperandRelationType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType,
> = {
  label: 'Is' | 'Is not';
  id: 'is' | 'is_not';
  whereTemplate: (value: WhereType) => BoolExpType<FilteredType>;
};

type FilterOperandFieldType<FilteredType extends FilterableFieldsType> = {
  label: 'Contains' | 'Does not contain' | 'Greater than' | 'Less than';
  id: 'like' | 'not_like' | 'greater_than' | 'less_than';
  whereTemplate: (value: string) => BoolExpType<FilteredType>;
};

export type SelectedFilterType<
  FilteredType extends FilterableFieldsType,
  WhereType extends FilterWhereType = UnknownType,
> = {
  key: string;
  value: WhereType extends UnknownType ? any : WhereType;
  displayValue: string;
  label: string;
  icon: ReactNode;
  operand: FilterOperandType<FilteredType, WhereType>;
};
