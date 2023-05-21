import { DocumentNode } from 'graphql';
import { ReactNode } from 'react';
import { AnyEntity, BoolExpType, GqlType } from '../entities/generic.interface';

type UnknownType = void;

export type SearchConfigType<
  SearchType extends AnyEntity | UnknownType = UnknownType,
> = SearchType extends UnknownType
  ? {
      query: DocumentNode;
      template: (searchInput: string) => any;
      resultMapper: (data: any) => any;
    }
  : {
      query: DocumentNode;
      template: (searchInput: string) => BoolExpType<SearchType>;
      resultMapper: (data: GqlType<SearchType>) => {
        value: SearchType;
        render: (value: SearchType) => ReactNode;
      };
    };
