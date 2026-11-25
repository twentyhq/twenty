import { act, renderHook } from '@testing-library/react';

import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useUpdateOneRecord';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

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
    result: jest.fn(() => ({
      data: {
        updatePerson,
      },
    })),
  },
];

jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
jest.mock('@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent');
jest.mock('@/object-record/cache/utils/getRecordFromCache', () => ({
  getRecordFromCache: jest.fn(() => null),
}));
jest.mock('@/object-record/cache/utils/updateRecordFromCache');
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect',
);

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

  it('announces the restored values when the server rejects the update', async () => {
    const cachedName = { firstName: 'Jane', lastName: 'Smith' };

    jest.mocked(getRecordFromCache).mockReturnValueOnce({
      id: idToUpdate,
      __typename: 'Person',
      name: cachedName,
    });

    const { result } = renderHook(() => useUpdateOneRecord(), {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        apolloMocks: [
          { request: { query, variables }, error: new Error('Rejected') },
        ],
      }),
    });

    await act(async () => {
      await expect(
        result.current.updateOneRecord({
          objectNameSingular: 'person',
          idToUpdate,
          updateOneRecordInput: updateInput,
        }),
      ).rejects.toThrow('Rejected');
    });

    expect(dispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(1);
    expect(dispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: {
          type: 'update-one',
          result: {
            updateInput: {
              recordId: idToUpdate,
              updatedFields: [{ name: cachedName }],
            },
          },
        },
      }),
    );
  });
});
