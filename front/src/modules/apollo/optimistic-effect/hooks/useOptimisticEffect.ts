import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { optimisticEffectState } from '../states/optimisticEffectState';
import { OptimisticEffect } from '../types/OptimisticEffect';

export function useOptimisticEffect() {
  const apolloClient = useApolloClient();

  const registerOptimisticEffect = useRecoilCallback(
    ({ snapshot, set }) =>
      (optimisticEffect: OptimisticEffect<unknown, unknown>) => {
        const { key } = optimisticEffect;
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        set(optimisticEffectState, {
          ...optimisticEffects,
          [key]: optimisticEffect,
        });
      },
  );

  const triggerOptimisticEffects = useRecoilCallback(
    ({ snapshot }) =>
      (typename: string, entities: any[]) => {
        const optimisticEffects = snapshot
          .getLoadable(optimisticEffectState)
          .getValue();

        Object.values(optimisticEffects).forEach((optimisticEffect) => {
          if (optimisticEffect.typename === typename) {
            optimisticEffect.resolver({
              cache: apolloClient.cache,
              entities,
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
}
