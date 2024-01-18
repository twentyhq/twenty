import { useApolloClient } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider addTypename={false}>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

describe('useOptimisticEvict', () => {
  it('should perform cache eviction', async () => {
    const mockedData = {
      'someType:1': { __typename: 'someType', id: '1', fieldName: 'value1' },
      'someType:2': { __typename: 'someType', id: '2', fieldName: 'value2' },
      'otherType:1': { __typename: 'otherType', id: '1', fieldName: 'value3' },
    };

    const { result } = renderHook(
      () => {
        const { cache } = useApolloClient();
        cache.restore(mockedData);

        return {
          ...useOptimisticEvict(),
          cache,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const { performOptimisticEvict, cache } = result.current;

    act(() => {
      performOptimisticEvict('someType', 'fieldName', 'value1');
    });

    const cacheSnapshot = cache.extract();

    expect(cacheSnapshot).toEqual({
      'someType:2': { __typename: 'someType', id: '2', fieldName: 'value2' },
      'otherType:1': { __typename: 'otherType', id: '1', fieldName: 'value3' },
    });
  });
});
