import { act, renderHook } from '@testing-library/react';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useDeleteManyRecords';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const people = [
  'a7286b9a-c039-4a89-9567-2dfa7953cda9',
  '37faabcd-cb39-4a0a-8618-7e3fda9afca0',
];

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        deletePeople: [responseData],
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useDeleteManyRecords', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useDeleteManyRecords({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.deleteManyRecords(people);
      expect(res).toBeDefined();
      expect(res[0]).toHaveProperty('id');
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
