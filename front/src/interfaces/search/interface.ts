import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import {
  Companies_Bool_Exp,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../generated/graphql';
import { AnyEntity, GqlType } from '../entities/generic.interface';

type UnknownType = void;

export type SearchConfigType<
  SearchType extends AnyEntity | UnknownType = AnyEntity,
> = SearchType extends AnyEntity
  ? {
      query: DocumentNode;
      template: (
        searchInput: string,
      ) => People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp;
      resultMapper: (data: GqlType<SearchType>) => {
        value: SearchType;
        render: (value: SearchType) => ReactNode;
      };
    }
  : {
      query: DocumentNode;
      template: (searchInput: string) => any;
      resultMapper: (data: any) => any;
    };
