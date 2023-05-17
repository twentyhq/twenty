import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import {
  Companies_Bool_Exp,
  Order_By,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../../generated/graphql';
import {
  Company,
  GraphqlQueryCompany,
} from '../../../interfaces/company.interface';
import {
  GraphqlQueryPerson,
  Person,
} from '../../../interfaces/person.interface';
import { GraphqlQueryUser, User } from '../../../interfaces/user.interface';

export type SortType<OrderByTemplate> =
  | {
      _type: 'default_sort';
      label: string;
      key: keyof OrderByTemplate & string;
      icon?: ReactNode;
    }
  | {
      _type: 'custom_sort';
      label: string;
      key: string;
      icon?: ReactNode;
      orderByTemplate: (order: Order_By) => OrderByTemplate;
    };

export type SelectedSortType<OrderByTemplate> = SortType<OrderByTemplate> & {
  order: 'asc' | 'desc';
};

type AnyEntity = { id: string } & Record<string, any>;
export type FilterableFieldsType = Person | Company;
export type FilterWhereType = Person | Company | User;

type FilterConfigGqlType<WhereType> = WhereType extends Company
  ? GraphqlQueryCompany
  : WhereType extends Person
  ? GraphqlQueryPerson
  : WhereType extends User
  ? GraphqlQueryUser
  : never;

export type BoolExpType<T> = T extends Company
  ? Companies_Bool_Exp
  : T extends Person
  ? People_Bool_Exp
  : T extends User
  ? Users_Bool_Exp
  : never;

export type FilterConfigType<
  FilteredType extends FilterableFieldsType = AnyEntity,
  WhereType extends FilterWhereType = AnyEntity,
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

export type SearchableType = Person | Company | User;

export type SearchConfigType<SearchType extends SearchableType> = {
  query: DocumentNode;
  template: (
    searchInput: string,
  ) => People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp;
  resultMapper: (data: FilterConfigGqlType<SearchType>) => {
    value: SearchType;
    render: (value: SearchType) => ReactNode;
  };
};

export type FilterOperandType<
  FilteredType extends FilterableFieldsType = AnyEntity,
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
  FilteredType extends FilterableFieldsType = AnyEntity,
  WhereType extends FilterWhereType = AnyEntity,
> = {
  key: string;
  value: WhereType;
  displayValue: string;
  label: string;
  icon: ReactNode;
  operand: FilterOperandType<FilteredType, WhereType>;
};
