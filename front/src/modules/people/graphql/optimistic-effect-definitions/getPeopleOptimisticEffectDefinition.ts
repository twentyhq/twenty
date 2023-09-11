import { Person } from '~/generated/graphql';

import { GET_PEOPLE } from '../queries/getPeople';

export const getPeopleOptimisticEffectDefinition = {
  key: 'generic-entity-table-data-people',
  typename: 'Person',
  query: GET_PEOPLE,
  resolver: ({
    currentData,
    newData,
  }: {
    currentData: Person[];
    newData: Person[];
  }) => {
    return [...newData, ...currentData];
  },
};
