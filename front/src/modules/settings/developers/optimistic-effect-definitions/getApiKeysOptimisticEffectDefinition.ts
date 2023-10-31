import { GET_API_KEYS } from '@/settings/developers/graphql/queries/getApiKeys';
import { ApiKey } from '~/generated/graphql';

export const getApiKeysOptimisticEffectDefinition = {
  key: 'generic-entity-table-data-api-keys',
  typename: 'ApiKey',
  query: GET_API_KEYS,
  resolver: ({
    currentData,
    newData,
  }: {
    currentData: ApiKey[];
    newData: ApiKey[];
  }) => {
    return [...newData, ...currentData];
  },
};
