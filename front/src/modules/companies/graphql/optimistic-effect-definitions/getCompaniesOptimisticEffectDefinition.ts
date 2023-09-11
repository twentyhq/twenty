import { Company } from '~/generated/graphql';

import { GET_COMPANIES } from '../queries/getCompanies';

export const getCompaniesOptimisticEffectDefinition = {
  key: 'generic-entity-table-data-companies',
  typename: 'Company',
  query: GET_COMPANIES,
  resolver: ({
    currentData,
    newData,
  }: {
    currentData: Company[];
    newData: Company[];
  }) => {
    return [...newData, ...currentData];
  },
};
