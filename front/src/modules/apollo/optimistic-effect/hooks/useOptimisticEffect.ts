import {
  ApolloCache,
  DocumentNode,
  OperationVariables,
  useApolloClient,
} from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { GetCompaniesQuery, GetPeopleQuery } from '~/generated/graphql';

import { optimisticEffectState } from '../states/optimisticEffectState';
import { OptimisticEffectDefinition } from '../types/OptimisticEffectDefinition';

export const useOptimisticEffect = () => {
  const apolloClient = useApolloClient();

  const registerOptimisticEffect = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        variables,
        definition,
      }: {
        variables: OperationVariables;
        definition: OptimisticEffectDefinition<unknown>;
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
                  currentData: (existingData as GetPeopleQuery).people,
                  newData,
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
                  currentData: (existingData as GetCompaniesQuery).companies,
                  newData,
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
          if (optimisticEffect.typename === typename) {
            optimisticEffect.writer({
              cache: apolloClient.cache,
              query: optimisticEffect.query,
              newData,
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
