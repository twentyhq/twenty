import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import {
  Companies_Bool_Exp,
  Order_By,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../../generated/graphql';

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

export type FilterType<WhereTemplate, FilterValue = Record<string, any>> = {
  operands: FilterOperandType[];
  label: string;
  key: string;
  icon: ReactNode;
  whereTemplate: (
    operand: FilterOperandType,
    value: FilterValue,
  ) => WhereTemplate | undefined;
  searchQuery: DocumentNode;
  searchTemplate: (
    searchInput: string,
  ) => People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp;
  searchResultMapper: (data: any) => {
    displayValue: string;
    value: FilterValue;
  };
};

export type FilterOperandType = {
  label: string;
  id: string;
  keyWord: 'ilike' | 'not_ilike' | 'equal' | 'not_equal';
};

export type SelectedFilterType<WhereTemplate> = FilterType<WhereTemplate> & {
  value: string;
  operand: FilterOperandType;
  where: WhereTemplate;
};
