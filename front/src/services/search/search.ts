import {
  LazyQueryResult,
  LazyQueryResultTuple,
  OperationVariables,
  QueryResult,
  useLazyQuery,
} from '@apollo/client';
import {
  Companies_Bool_Exp,
  People_Bool_Exp,
  Users_Bool_Exp,
} from '../../generated/graphql';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import {
  GraphqlQueryAccountOwner,
  GraphqlQueryCompany,
} from '../../interfaces/company.interface';
import { GET_PEOPLE } from '../people';

export function useLazySearch(): [
  (
    where: People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp,
  ) => Promise<QueryResult<any>>,
  Partial<QueryResult<any>>,
] {
  const [searchLazyQuery, { loading, error, data }] = useLazyQuery<{
    people:
      | GraphqlQueryPerson[]
      | GraphqlQueryCompany[]
      | GraphqlQueryAccountOwner[];
  }>(GET_PEOPLE);

  const searchQuery = (
    where: People_Bool_Exp | Companies_Bool_Exp | Users_Bool_Exp,
  ) => {
    return searchLazyQuery({
      variables: {
        where,
      },
    });
  };

  return [searchQuery, { loading, error, data }];
}
