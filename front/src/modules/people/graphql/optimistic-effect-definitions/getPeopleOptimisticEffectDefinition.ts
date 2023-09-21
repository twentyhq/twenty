import { GetPeopleDocument, Person } from '~/generated/graphql';

export const getPeopleOptimisticEffectDefinition = {
  key: 'generic-entity-table-data-people',
  typename: 'Person',
  query: GetPeopleDocument,
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
