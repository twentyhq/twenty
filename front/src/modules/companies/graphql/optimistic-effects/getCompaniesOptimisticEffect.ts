import { ApolloCache } from '@apollo/client';

import {
  Company,
  GetCompaniesQuery,
  GetCompaniesQueryVariables,
} from '~/generated/graphql';

import { GET_COMPANIES } from '../queries/getCompanies';

function optimisticEffectResolver({
  cache,
  entities,
  variables,
}: {
  cache: ApolloCache<Company>;
  entities: Company[];
  variables: GetCompaniesQueryVariables;
}) {
  const existingData = cache.readQuery<GetCompaniesQuery>({
    query: GET_COMPANIES,
    variables: { orderBy: variables.orderBy, where: variables.where },
  });

  if (!existingData) {
    return;
  }

  cache.writeQuery({
    query: GET_COMPANIES,
    variables: { orderBy: variables.orderBy, where: variables.where },
    data: {
      people: [...entities, ...existingData.companies],
    },
  });
}

export function getCompaniesOptimisticEffect(
  variables: GetCompaniesQueryVariables,
) {
  return {
    key: 'generic-entity-table-data-companies',
    variables: variables,
    typename: 'Company',
    resolver: optimisticEffectResolver,
  };
}
