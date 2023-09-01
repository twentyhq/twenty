import { ApolloCache } from '@apollo/client';

import {
  GetPeopleQuery,
  GetPeopleQueryVariables,
  Person,
} from '~/generated/graphql';

import { GET_PEOPLE } from '../queries/getPeople';

function optimisticEffectCallback({
  cache,
  entities,
  variables,
}: {
  cache: ApolloCache<Person>;
  entities: Person[];
  variables: GetPeopleQueryVariables;
}) {
  const existingData = cache.readQuery<GetPeopleQuery>({
    query: GET_PEOPLE,
    variables: { orderBy: variables.orderBy, where: variables.where },
  });

  if (!existingData) {
    return;
  }

  cache.writeQuery({
    query: GET_PEOPLE,
    variables: { orderBy: variables.orderBy, where: variables.where },
    data: {
      people: [...entities, ...existingData.people],
    },
  });
}

export function getPeopleOptimisticEffect(variables: GetPeopleQueryVariables) {
  return {
    key: 'generic-entity-table-data-person',
    variables: variables,
    typename: 'Person',
    resolver: optimisticEffectCallback,
  };
}
