import { renderHook, waitFor } from '@testing-library/react';

import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';

import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useFindDuplicateRecords';
import { vi } from 'vitest';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: vi.fn(() => ({
      data: responseData,
    })),
  },
];

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFindDuplicateRecords', () => {
  it('should fetch duplicate records and return the correct data', async () => {
    const objectRecordId = '6205681e-7c11-40b4-9e32-f523dbe54590';
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecords({
          objectRecordIds: [objectRecordId],
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.results).toBeDefined();
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
