import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  type UseRecordDataOptions,
  useRecordIndexLazyFetchRecords,
} from '@/object-record/record-index/export/hooks/useRecordIndexLazyFetchRecords';

import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { getRecordExportFields } from '@/object-record/record-index/export/utils/getRecordExportFields';
import { ViewType } from '@/views/types/ViewType';
import {
  buildRecordExportColumns,
  formatRecordExportHeader,
  formatRecordExportRow,
  isDefined,
} from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
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
        expect(callback).toHaveBeenCalledWith({
          rows: [mockPerson],
          columns: [],
        });
      });
    });
  });

  it.each([false, true])(
    'exports morph target IDs from visible index fields, singlePage=%s',
    async (singlePage) => {
      const morphObjectMetadataItem =
        getMockObjectMetadataItemOrThrow('petCareAgreement');
      const morphField = morphObjectMetadataItem.fields.find(
        (field) => field.name === 'caretaker',
      );

      if (!isDefined(morphField)) {
        throw new Error('Caretaker field not found');
      }

      const callback = jest.fn<
        void,
        Parameters<UseRecordDataOptions['callback']>
      >();
      const record = {
        id: 'agreement-1',
        caretakerPersonId: 'person-1',
        caretakerCompanyId: null,
      };
      mockFetchAllRecords.mockResolvedValue([record]);
      mockFetchFirstPage.mockResolvedValue({
        records: [record],
        hasNextPage: false,
      });
      const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
        apolloMocks: [],
        componentInstanceId: recordIndexId,
        contextStoreTargetedRecordsRule: {
          mode: 'selection',
          selectedRecordIds: [],
        },
        contextStoreCurrentObjectMetadataNameSingular: 'petCareAgreement',
        onInitializeJotaiStore: (store) => {
          store.set(
            currentRecordFieldsComponentState.atomFamily({
              instanceId: recordIndexId,
            }),
            [
              {
                id: 'caretaker-column',
                fieldMetadataItemId: morphField.id,
                position: 0,
                isVisible: true,
                size: 100,
              },
            ],
          );
        },
      });
      const { result } = renderHook(
        () =>
          useRecordIndexLazyFetchRecords({
            recordIndexId,
            objectMetadataItem: morphObjectMetadataItem,
            callback,
            delayMs: 0,
            onMoreRecords: singlePage ? jest.fn() : undefined,
          }),
        { wrapper },
      );

      await act(() => result.current.getTableData());

      expect(callback).toHaveBeenCalledTimes(1);
      const { columns, rows } = callback.mock.calls[0][0];
      const exportColumns = buildRecordExportColumns(
        getRecordExportFields({
          columns,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        }),
      );

      expect(formatRecordExportHeader(exportColumns)).toBe(
        '\uFEFFId,Caretaker / Person Id,Caretaker / Company Id\n',
      );
      expect(
        formatRecordExportRow({ columns: exportColumns, record: rows[0] }),
      ).toBe('agreement-1,person-1,\n');
    },
  );

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
          expect(callback).toHaveBeenCalledWith({ rows: records, columns: [] });
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
});
