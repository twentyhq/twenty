import { act, renderHook } from '@testing-library/react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  query,
  responseData,
} from '@/object-record/hooks/__mocks__/useCreateOneRecord';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { vi } from 'vitest';

const personId = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';
const input = { name: { firstName: 'John', lastName: 'Doe' } };

vi.mock('uuid', () => ({
  v4: vi.fn(() => personId),
}));

vi.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = vi.fn();
vi.mocked(useRefetchAggregateQueries).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

const mocks = [
  {
    request: {
      query,
      variables: { input: { ...input, id: personId } },
    },
    result: vi.fn(() => ({
      data: {
        createPerson: { ...responseData, ...input, id: personId },
      },
    })),
  },
];

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateOneRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('works as expected', async () => {
    const { result } = renderHook(
      () =>
        useCreateOneRecord({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createOneRecord(input);
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', personId);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });
});
