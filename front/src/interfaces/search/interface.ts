import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import {
  Companies_Bool_Exp,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../generated/graphql';
import { Person } from '../entities/person.interface';
import { Company } from '../entities/company.interface';
import { User } from '../entities/user.interface';
import { GqlType } from '../entities/generic.interface';

export type SearchableType = Person | Company | User;

export type SearchConfigType<SearchType extends SearchableType> = {
  query: DocumentNode;
  template: (
    searchInput: string,
  ) => People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp;
  resultMapper: (data: GqlType<SearchType>) => {
    value: SearchType;
    render: (value: SearchType) => ReactNode;
  };
};
