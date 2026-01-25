import { act, renderHook } from '@testing-library/react';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useUpdateOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { vi } from 'vitest';

const person = { id: '36abbb63-34ed-4a16-89f5-f549ac55d0f9' };
const updateInput = {
  name: {
    firstName: 'John',
    lastName: 'Doe',
  },
};
const updatePerson = {
  ...person,
  ...responseData,
  ...updateInput,
};

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: vi.fn(() => ({
      data: {
        updatePerson,
      },
    })),
  },
];

vi.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = vi.fn();
vi.mocked(useRefetchAggregateQueries).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

const idToUpdate = '36abbb63-34ed-4a16-89f5-f549ac55d0f9';

describe('useUpdateOneRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('works as expected', async () => {
    const { result } = renderHook(() => useUpdateOneRecord(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.updateOneRecord({
        objectNameSingular: 'person',
        idToUpdate,
        updateOneRecordInput: updateInput,
      });
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', person.id);
      expect(res).toHaveProperty('name', updateInput.name);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });
});
