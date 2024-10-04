import { renderHook, waitFor } from '@testing-library/react';

import {
  query,
  variables,
} from '@/object-record/hooks/__mocks__/useFindOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { generateEmptyJestRecordNode } from '~/testing/jest/generateEmptyJestRecordNode';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        person: generateEmptyJestRecordNode({
          objectNameSingular: 'person',
          input: { id: '6205681e-7c11-40b4-9e32-f523dbe54590' },
          withDepthOneRelation: true,
        }),
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

const objectRecordId = '6205681e-7c11-40b4-9e32-f523dbe54590';

describe('useFindOneRecord', () => {
  it('should skip fetch if currentWorkspace is undefined', async () => {
    const { result } = renderHook(
      () => useFindOneRecord({ objectNameSingular: 'person', objectRecordId }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.record).toBeUndefined();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.record).toBeDefined();
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
