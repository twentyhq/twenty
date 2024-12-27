import { act, renderHook } from '@testing-library/react';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useUpdateOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { expect } from '@storybook/test';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const person = { id: '36abbb63-34ed-4a16-89f5-f549ac55d0f9' };
const update = {
  name: {
    firstName: 'John',
    lastName: 'Doe',
  },
};
const updatePerson = {
  ...person,
  ...responseData,
  ...update,
};

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        updatePerson,
      },
    })),
  },
];

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

const idToUpdate = '36abbb63-34ed-4a16-89f5-f549ac55d0f9';

describe('useUpdateOneRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useUpdateOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.updateOneRecord({
        idToUpdate,
        updateOneRecordInput: updatePerson,
      });
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', person.id);
      expect(res).toHaveProperty('name', update.name);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });
});
