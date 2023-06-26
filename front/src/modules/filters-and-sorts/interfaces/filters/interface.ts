import { ReactNode } from 'react';

import { SearchConfigType } from '@/search/interfaces/interface';

export type FilterableFieldsType = any;
export type FilterWhereRelationType = any;
export type FilterWhereType = FilterWhereRelationType | string | unknown;

export type FilterConfigType<WhereType extends FilterWhereType = unknown> = {
  key: string;
  label: string;
  icon: ReactNode;
  type: WhereType extends unknown
    ? 'relation' | 'text' | 'date'
    : WhereType extends any
    ? 'relation'
    : WhereType extends string
    ? 'text' | 'date'
    : never;
  operands: FilterOperandType<WhereType>[];
} & (WhereType extends unknown
  ? { searchConfig?: SearchConfigType }
  : WhereType extends any
  ? { searchConfig: SearchConfigType }
  : WhereType extends string
  ? object
  : never) &
  (WhereType extends unknown
    ? { selectedValueRender?: (selected: any) => string }
    : WhereType extends any
    ? { selectedValueRender: (selected: WhereType) => string }
    : WhereType extends string
    ? object
    : never);

export type FilterOperandType<WhereType extends FilterWhereType = unknown> =
  WhereType extends unknown
    ? any
    : WhereType extends FilterWhereRelationType
    ? FilterOperandRelationType<WhereType>
    : WhereType extends string
    ? FilterOperandFieldType
    : never;

type FilterOperandRelationType<WhereType extends FilterWhereType> = {
  label: 'Is' | 'Is not';
  id: 'is' | 'is_not';
  whereTemplate: (value: WhereType) => any;
};

type FilterOperandFieldType = {
  label: 'Contains' | "Doesn't contain" | 'Greater than' | 'Less than';
  id: 'like' | 'not_like' | 'greater_than' | 'less_than';
  whereTemplate: (value: string) => any;
};

export type SelectedFilterType<WhereType> = {
  key: string;
  value: WhereType;
  displayValue: string;
  label: string;
  icon: ReactNode;
  operand: FilterOperandType<WhereType>;
};
