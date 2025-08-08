import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import {
  percentage,
  sleep,
  useRecordIndexLazyFetchRecords,
} from '../useRecordIndexLazyFetchRecords';

import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { ViewType } from '@/views/types/ViewType';
import { expect } from '@storybook/test';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

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

const Wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
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
  const objectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === 'person',
  );
  let mockFetchAllRecords: jest.Mock;

  beforeEach(() => {
    // Mock the hook's implementation
    mockFetchAllRecords = jest.fn();
    (useLazyFetchAllRecords as jest.Mock).mockReturnValue({
      progress: 100,
      isDownloading: false,
      fetchAllRecords: mockFetchAllRecords, // Mock the function
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
            viewType: ViewType.Kanban,
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
        () =>
          useRecordIndexLazyFetchRecords({
            recordIndexId,
            objectMetadataItem,
            callback,
            pageSize: 30,
            delayMs: 0,
          }),
        { wrapper: Wrapper },
      );

      await act(async () => {
        result.current.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith([mockPerson], []);
      });
    });

    it('should call the callback function with kanban field included as column if view type is kanban', async () => {
      const callback = jest.fn();

      mockFetchAllRecords.mockReturnValue([mockPerson]);

      const { result } = renderHook(
        () => {
          const [recordGroupFieldMetadata, setRecordGroupFieldMetadata] =
            useRecoilComponentState(
              recordGroupFieldMetadataComponentState,
              recordIndexId,
            );

          return {
            tableData: useRecordIndexLazyFetchRecords({
              recordIndexId,
              objectMetadataItem,
              callback,
              pageSize: 30,
              maximumRequests: 100,
              delayMs: 0,
              viewType: ViewType.Kanban,
            }),
            kanbanFieldName: recordGroupFieldMetadata?.name,
            setRecordGroupFieldMetadata,
            kanbanData: useObjectOptionsForBoard({
              objectNameSingular: objectMetadataItem.nameSingular,
              recordBoardId: recordIndexId,
              viewBarId: recordIndexId,
            }),
          };
        },
        {
          wrapper: Wrapper,
        },
      );

      const personObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === 'person',
      );

      const updatedAtFieldMetadataItem = personObjectMetadataItem?.fields.find(
        (field) => field.name === 'updatedAt',
      );

      await act(async () => {
        result.current.setRecordGroupFieldMetadata(updatedAtFieldMetadataItem);
      });

      await act(async () => {
        result.current.tableData.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith(
          [mockPerson],
          [
            {
              defaultValue: 'now',
              editButtonIcon: undefined,
              fieldMetadataId: updatedAtFieldMetadataItem?.id,
              iconName: 'IconCalendarClock',
              isFilterable: true,
              isLabelIdentifier: false,
              isSortable: true,
              isVisible: false,
              label: 'Last update',
              labelWidth: undefined,
              metadata: {
                fieldName: 'updatedAt',
                isCustom: false,
                isNullable: false,
                objectMetadataNameSingular: 'person',
                options: null,
                placeHolder: 'Last update',
                relationFieldMetadataId: undefined,
                relationObjectMetadataId: '',
                relationObjectMetadataNamePlural: '',
                relationObjectMetadataNameSingular: '',
                relationType: undefined,
                targetFieldMetadataName: '',
                settings: {
                  displayFormat: 'RELATIVE',
                },
              },
              position: 9,
              showLabel: undefined,
              size: 100,
              type: 'DATE_TIME',
            },
          ],
        );
      });
    });

    it('should not call the callback function with kanban field included as column if view type is table', async () => {
      const callback = jest.fn();
      mockFetchAllRecords.mockReturnValue([mockPerson]);
      const { result } = renderHook(
        () => {
          const [recordGroupFieldMetadata, setRecordGroupFieldMetadata] =
            useRecoilComponentState(
              recordGroupFieldMetadataComponentState,
              recordIndexId,
            );

          return {
            tableData: useRecordIndexLazyFetchRecords({
              recordIndexId,
              objectMetadataItem,
              callback,
              pageSize: 30,
              maximumRequests: 100,
              delayMs: 0,
              viewType: ViewType.Table,
            }),
            objectMetadataItem,
            kanbanFieldName: recordGroupFieldMetadata?.name,
            setRecordGroupFieldMetadata,
            kanbanData: useObjectOptionsForBoard({
              objectNameSingular: objectMetadataItem.nameSingular,
              recordBoardId: recordIndexId,
              viewBarId: recordIndexId,
            }),
          };
        },
        {
          wrapper: Wrapper,
        },
      );

      await act(async () => {
        const fieldMetadataItem =
          result.current.objectMetadataItem?.fields.find(
            (fieldMetadata) =>
              fieldMetadata.id ===
              result.current.kanbanData.hiddenBoardFields[0].fieldMetadataId,
          );

        result.current.setRecordGroupFieldMetadata(fieldMetadataItem);
      });

      await act(async () => {
        result.current.tableData.getTableData();
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith([mockPerson], []);
      });
    });
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
