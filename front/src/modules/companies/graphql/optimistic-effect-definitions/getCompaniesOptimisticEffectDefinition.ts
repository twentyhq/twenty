import { Company, GetCompaniesDocument } from '~/generated/graphql';

export const getCompaniesOptimisticEffectDefinition = {
  key: 'generic-entity-table-data-companies',
  typename: 'Company',
  query: GetCompaniesDocument,
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
