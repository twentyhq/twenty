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

export type FilterType<WhereTemplate, T = Record<string, string>> = {
  label: string;
  key: string;
  icon: ReactNode;
  whereTemplate: (operand: FilterOperandType, value: T) => WhereTemplate;
  searchQuery: DocumentNode;
  searchTemplate: (
    searchInput: string,
  ) => People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp;
  searchResultMapper: (data: any) => { displayValue: string; value: T };
};

export type FilterOperandType = {
  label: string;
  id: string;
  keyWord: 'ilike' | 'not_ilike';
};

export type SelectedFilterType<WhereTemplate> = FilterType<WhereTemplate> & {
  value: string;
  operand: FilterOperandType;
  where: WhereTemplate;
};
