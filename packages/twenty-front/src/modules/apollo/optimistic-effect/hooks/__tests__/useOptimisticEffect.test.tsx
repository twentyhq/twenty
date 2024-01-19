import { useApolloClient } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { optimisticEffectState } from '@/apollo/optimistic-effect/states/optimisticEffectState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider addTypename={false}>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

describe('useOptimisticEffect', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const optimisticEffect = useRecoilValue(optimisticEffectState);
        const client = useApolloClient();
        const { findManyRecordsQuery } = useObjectMetadataItem({
          objectNameSingular: 'person',
        });
        return {
          ...useOptimisticEffect({ objectNameSingular: 'person' }),
          optimisticEffect,
          cache: client.cache,
          findManyRecordsQuery,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const {
      registerOptimisticEffect,
      unregisterOptimisticEffect,
      triggerOptimisticEffects,
      optimisticEffect,
      findManyRecordsQuery,
    } = result.current;

    expect(registerOptimisticEffect).toBeDefined();
    expect(typeof registerOptimisticEffect).toBe('function');
    expect(optimisticEffect).toEqual({});

    const optimisticEffectDefinition = {
      variables: {},
      definition: {
        typename: 'Person',
        resolver: () => ({
          people: [],
          pageInfo: {
            endCursor: '',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: '',
          },
          edges: [],
        }),
      },
    };

    act(() => {
      registerOptimisticEffect(optimisticEffectDefinition);
    });

    await waitFor(() => {
      expect(result.current.optimisticEffect).toHaveProperty('Person-{}');
    });

    expect(
      result.current.cache.readQuery({ query: findManyRecordsQuery }),
    ).toBeNull();

    act(() => {
      triggerOptimisticEffects({
        typename: 'Person',
        createdRecords: [{ id: 'id-0' }],
      });
    });

    await waitFor(() => {
      expect(
        result.current.cache.readQuery({ query: findManyRecordsQuery }),
      ).toHaveProperty('people');
    });

    act(() => {
      unregisterOptimisticEffect(optimisticEffectDefinition);
    });

    await waitFor(() => {
      expect(result.current.optimisticEffect).not.toHaveProperty('Person-{}');
      expect(result.current.optimisticEffect).toEqual({});
    });
  });
});
