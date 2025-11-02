import { expect } from '@storybook/test';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { useLazyFetchMoreRecordsWithPagination } from '@/object-record/hooks/useLazyFetchMoreRecordsWithPagination';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('useLazyFetchMoreRecordsWithPagination', () => {
  it('defaults to the provided limit when fetching more records', async () => {
    const objectMetadataItem = generatedMockObjectMetadataItems[0];

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const exportLimit = 200;
    const objectNameSingular = objectMetadataItem.nameSingular;

    const fetchMoreResultData = {
      [objectMetadataItem.namePlural]: {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
        totalCount: 0,
      },
    };

    const fetchMoreMock = jest.fn(
      async (options: {
        variables: {
          limit?: number;
        };
        updateQuery?: (
          previousQueryResult: unknown,
          context: { fetchMoreResult: typeof fetchMoreResultData },
        ) => unknown;
      }) => {
        options.updateQuery?.({}, { fetchMoreResult: fetchMoreResultData });

        return { data: fetchMoreResultData };
      },
    );

    const queryIdentifier = getQueryIdentifier({
      objectNameSingular,
      filter: undefined,
      orderBy: undefined,
      limit: exportLimit,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(hasNextPageFamilyState(queryIdentifier), true);
          set(cursorFamilyState(queryIdentifier), 'cursor-1');
        }}
      >
        <SnackBarComponentInstanceContext.Provider
          value={{ instanceId: 'snack-bar-manager' }}
        >
          {children}
        </SnackBarComponentInstanceContext.Provider>
      </RecoilRoot>
    );

    const { result } = renderHook(
      () =>
        useLazyFetchMoreRecordsWithPagination({
          objectNameSingular,
          filter: undefined,
          orderBy: undefined,
          limit: exportLimit,
          error: undefined,
          fetchMore: fetchMoreMock,
          objectMetadataItem,
          data: undefined,
        }),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.fetchMoreRecordsLazy();
    });

    expect(fetchMoreMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ limit: exportLimit }),
      }),
    );
  });
});
