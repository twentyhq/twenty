import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import {
  Companies_Bool_Exp,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../../generated/graphql';

export type SortType<SortKey = string> = {
  label: string;
  key: SortKey;
  icon?: ReactNode;
};

export type SelectedSortType<SortField = string> = SortType<SortField> & {
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
  ) => WhereTemplate;
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
