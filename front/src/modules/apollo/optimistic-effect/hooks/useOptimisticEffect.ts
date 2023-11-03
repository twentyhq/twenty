import {
  ApolloCache,
  DocumentNode,
  OperationVariables,
  useApolloClient,
} from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { GET_API_KEYS } from '@/settings/developers/graphql/queries/getApiKeys';
import {
  GetApiKeysQuery,
  GetCompaniesQuery,
  GetPeopleQuery,
} from '~/generated/graphql';

import { optimisticEffectState } from '../states/optimisticEffectState';
import { OptimisticEffectDefinition } from '../types/OptimisticEffectDefinition';

export const useOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const registerOptimisticEffect = useRecoilCallback(
    ({ snapshot, set }) =>
      <T>({
        variables,
        definition,
      }: {
        variables: OperationVariables;
        definition: OptimisticEffectDefinition<T>;
      }) => {
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        const optimisticEffectWriter = ({
          cache,
          newData,
          query,
          variables,
        }: {
          cache: ApolloCache<unknown>;
          newData: unknown[];
          variables: OperationVariables;
          query: DocumentNode;
        }) => {
          const existingData = cache.readQuery({
            query,
            variables,
          });

          if (!existingData) {
            return;
          }

          if (query === GET_PEOPLE) {
            cache.writeQuery({
              query,
              variables,
              data: {
                people: definition.resolver({
                  currentData: (existingData as GetPeopleQuery).people as T[],
                  newData: newData as T[],
                  variables,
                }),
              },
            });
          }

          if (query === GET_COMPANIES) {
            cache.writeQuery({
              query,
              variables,
              data: {
                companies: definition.resolver({
                  currentData: (existingData as GetCompaniesQuery)
                    .companies as T[],
                  newData: newData as T[],
                  variables,
                }),
              },
            });
          }
          if (query === GET_API_KEYS) {
            cache.writeQuery({
              query,
              variables,
              data: {
                findManyApiKey: definition.resolver({
                  currentData: (existingData as GetApiKeysQuery)
                    .findManyApiKey as T[],
                  newData: newData as T[],
                  variables,
                }),
              },
            });
          }
        };

        const optimisticEffect = {
          key: definition.key,
          variables,
          typename: definition.typename,
          query: definition.query,
          writer: optimisticEffectWriter,
        };

        set(optimisticEffectState, {
          ...optimisticEffects,
          [definition.key]: optimisticEffect,
        });
      },
  );

  const triggerOptimisticEffects = useRecoilCallback(
    ({ snapshot }) =>
      (typename: string, newData: any[]) => {
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        Object.values(optimisticEffects).forEach((optimisticEffect) => {
          // We need to update the typename when createObject type differs from listObject types
          // It is the case for apiKey, where the creation route returns an ApiKeyToken type
          const formattedNewData = newData.map((data) => {
            return { ...data, __typename: typename };
          });
          if (optimisticEffect.typename === typename) {
            optimisticEffect.writer({
              cache: apolloClient.cache,
              query: optimisticEffect.query,
              newData: formattedNewData,
              variables: optimisticEffect.variables,
            });
          }
        });
      },
  );

  return {
    registerOptimisticEffect,
    triggerOptimisticEffects,
  };
};
