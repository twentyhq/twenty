import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  percentage,
  sleep,
  useRecordIndexLazyFetchRecords,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';

import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { ViewType } from '@/views/types/ViewType';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockPerson = {
  __typename: 'Person',
  avatarUrl: 'avatarUrl',
  city: 'city',
  companyId: '1',
  createdAt: '2021-08-03T19:20:06.000Z',
  createdBy: {
    name: 'name',
    source: 'source',
    workspaceMemberId: '1',
  },
  deletedAt: null,
  emails: {
    additionalEmails: [],
    primaryEmail: 'email',
  },
  id: '123',
  intro: 'intro',
  jobTitle: 'jobTitle',
  linkedinLink: {
    primaryLinkLabel: 'linkedin',
    primaryLinkUrl: 'https://www.linkedin.com',
    secondaryLinks: ['https://www.linkedin.com'],
  },
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  performanceRating: 1,
  phones: {
    additionalPhones: [],
    primaryPhoneCountryCode: '234-567-890',
    primaryPhoneNumber: '+1',
  },
  position: 'position',
  updatedAt: '2021-08-03T19:20:06.000Z',
  whatsapp: {
    additionalPhones: [],
    primaryPhoneCallingCode: '+33',
    primaryPhoneCountryCode: '234-567-890',
    primaryPhoneNumber: '+1',
  },
  workPreference: 'workPreference',
  xLink: {
    primaryLinkLabel: 'linkedin',
    primaryLinkUrl: 'https://www.linkedin.com',
    secondaryLinks: ['https://www.linkedin.com'],
  },
};

const Wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: 'recordIndexId',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreCurrentObjectMetadataNameSingular: 'person',
});

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: jest.fn(),
}));

describe('useRecordData', () => {
  const recordIndexId = 'people';
  const objectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === 'person',
  );
  let mockFetchAllRecords: jest.Mock;
  let mockFetchFirstPage: jest.Mock;

  beforeEach(() => {
    mockFetchAllRecords = jest.fn();
    mockFetchFirstPage = jest.fn();
    (useLazyFetchAllRecords as jest.Mock).mockReturnValue({
      progress: 100,
      isDownloading: false,
      fetchAllRecords: mockFetchAllRecords, // Mock the function
      fetchFirstPage: mockFetchFirstPage,
    });
  });
  if (!objectMetadataItem) {
    throw new Error('Object metadata item not found');
  }

  describe('data fetching', () => {
    it('should handle no records', async () => {
      const callback = jest.fn();

      mockFetchAllRecords.mockReturnValue([]);

      const { result } = renderHook(
        () =>
          useRecordIndexLazyFetchRecords({
            recordIndexId,
            objectMetadataItem,
            pageSize: 30,
            callback,
            delayMs: 0,
            viewType: ViewType.KANBAN,
          }),
        {
          wrapper: Wrapper,
        },
      );

      await act(async () => {
        result.current.getTableData();
      });

      await waitFor(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should call the callback function with fetched data', async () => {
      const callback = jest.fn();
      mockFetchAllRecords.mockReturnValue([mockPerson]);

      const { result } = renderHook(
        () => {
          const lazyFetchResult = useRecordIndexLazyFetchRecords({
            recordIndexId,
            objectMetadataItem,
            callback,
            pageSize: 30,
            delayMs: 0,
          });

          return {
            lazyFetchResult,
          };
        },
        { wrapper: Wrapper },
      );

      await act(async () => {
        result.current.lazyFetchResult.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith([mockPerson], []);
      });
    });
  });

  describe('single-page exports', () => {
    const callback = jest.fn();
    const onMoreRecords = jest.fn();
    const renderExport = (abortSignal?: AbortSignal) =>
      renderHook(
        () =>
          useRecordIndexLazyFetchRecords({
            recordIndexId,
            objectMetadataItem,
            callback,
            delayMs: 0,
            onMoreRecords,
            abortSignal,
          }),
        { wrapper: Wrapper },
      );

    beforeEach(() => jest.clearAllMocks());

    it.each([0, 20, 200, 201])(
      'exports %i records using the appropriate path',
      async (count) => {
        const records = Array.from(
          { length: Math.min(count, 200) },
          (_, index) => ({
            ...mockPerson,
            id: String(index),
          }),
        );
        mockFetchFirstPage.mockResolvedValue({
          records,
          totalCount: count,
          hasNextPage: count > 200,
        });
        const { result } = renderExport();

        await act(() => result.current.getTableData());

        if (count > 0 && count <= 200) {
          expect(callback).toHaveBeenCalledWith(records, []);
        } else {
          expect(callback).not.toHaveBeenCalled();
        }
        expect(onMoreRecords).toHaveBeenCalledTimes(count > 200 ? 1 : 0);
        expect(mockFetchAllRecords).not.toHaveBeenCalled();
        expect(useLazyFetchAllRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({ limit: 200, fetchPolicy: 'network-only' }),
        );
      },
    );

    it('propagates a failed first-page query without starting an export', async () => {
      mockFetchFirstPage.mockResolvedValue({
        error: new Error('Query failed'),
      });
      const { result } = renderExport();

      await expect(result.current.getTableData()).rejects.toThrow(
        'Query failed',
      );

      expect(callback).not.toHaveBeenCalled();
      expect(onMoreRecords).not.toHaveBeenCalled();
    });

    it.each([false, true])(
      'ignores a first page received after cancellation, hasNextPage=%s',
      async (hasNextPage) => {
        const abortController = new AbortController();
        mockFetchFirstPage.mockImplementation(async () => {
          abortController.abort();
          return { records: [mockPerson], hasNextPage };
        });
        const { result } = renderExport(abortController.signal);

        await act(() => result.current.getTableData());

        expect(callback).not.toHaveBeenCalled();
        expect(onMoreRecords).not.toHaveBeenCalled();
      },
    );
  });

  describe('utils', () => {
    it('should correctly calculate percentage', () => {
      expect(percentage(50, 200)).toBe(25);
      expect(percentage(1, 3)).toBe(33);
    });

    it('should resolve sleep after given time', async () => {
      jest.useFakeTimers();
      const sleepPromise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(sleepPromise).resolves.toBeUndefined();
    });
  });
});
