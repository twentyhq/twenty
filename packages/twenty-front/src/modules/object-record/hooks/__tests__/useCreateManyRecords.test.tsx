import { mocked } from '@storybook/test';
import { act, renderHook } from '@testing-library/react';
import { v4 } from 'uuid';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import {
  query,
  response,
  variables,
} from '@/object-record/hooks/__mocks__/useCreateManyRecords';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
const mockRefetchAggregateQueries = jest.fn();
(useRefetchAggregateQueries as jest.Mock).mockReturnValue({
  refetchAggregateQueries: mockRefetchAggregateQueries,
});

mocked(v4)
  .mockReturnValueOnce(variables.data[0].id)
  .mockReturnValueOnce(variables.data[1].id);

const input = variables.data.map(({ id: _id, ...personInput }) => personInput);

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createPeople: response,
      },
    })),
  },
  {
    request: {
      query,
      variables: {
        data: input,
        upsert: true,
      },
    },
    result: jest.fn(() => ({
      data: {
        createPeople: response,
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useCreateManyRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('works as expected', async () => {
    const { result } = renderHook(
      () =>
        useCreateManyRecords({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createManyRecords({
        recordsToCreate: input,
      });
      expect(res).toEqual(response);
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });

  it('does not indicate id in request variables when upsert is true because we cant know if it will be an insert or an update', async () => {
    const { result } = renderHook(
      () =>
        useCreateManyRecords({
          objectNameSingular: CoreObjectNameSingular.Person,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createManyRecords({
        recordsToCreate: input,
        upsert: true,
      });
      expect(res).toEqual(response);
    });

    // Verify that the mutation was called with data without IDs
    expect(mocks[1].request.variables.data).toEqual(input);
    mocks[1].request.variables.data.forEach((record: any) => {
      expect(record).not.toHaveProperty('id');
    });
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });
});
