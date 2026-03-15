import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { useStore } from 'jotai';

import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerAdditionalFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerAdditionalFilterComponentState';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

const INSTANCE_ID = 'test-instance';
const COMPANY_META_ID = 'company-meta-id';

const mockQuery = jest.fn();

jest.mock('@/command-menu/graphql/queries/search', () => ({
  SEARCH_QUERY: {},
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query: mockQuery }),
}));

jest.mock(
  '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords',
  () => ({
    usePerformCombinedFindManyRecords: () => ({
      performCombinedFindManyRecords: jest
        .fn()
        .mockResolvedValue({ result: {} }),
    }),
  }),
);

// Empty permissions map → defaults to canReadObjectRecords: true for all objects
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: jest.fn(),
}));

const mockObjectMetadataItem: ObjectMetadataItem = {
  id: COMPANY_META_ID,
  nameSingular: 'company',
  fields: [],
  readableFields: [],
  updatableFields: [],
  indexMetadatas: [],
  labelIdentifierFieldMetadataId: '',
} as unknown as ObjectMetadataItem;

const emptySearchResult = {
  data: {
    search: {
      edges: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  },
};

describe('useMultipleRecordPickerPerformSearch', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    mockQuery.mockResolvedValue(emptySearchResult);

    store = createStore();

    store.set(
      multipleRecordPickerPaginationState.atomFamily({ instanceId: INSTANCE_ID }),
      { endCursor: null, hasNextPage: false },
    );
    store.set(
      multipleRecordPickerSearchFilterComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      '',
    );
    store.set(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
        { instanceId: INSTANCE_ID },
      ),
      [mockObjectMetadataItem],
    );
    store.set(
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      [],
    );
    store.set(
      multipleRecordPickerAdditionalFilterComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      undefined,
    );

    (useStore as jest.Mock).mockReturnValue(store);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('additionalFilter with no picked records', () => {
    it('should apply forceAdditionalFilter to the search query', async () => {
      const { result } = renderHook(() =>
        useMultipleRecordPickerPerformSearch(),
      );

      const additionalFilter: ObjectRecordFilterInput = {
        not: { id: { in: ['parent-1'] } },
      };

      await act(async () => {
        await result.current.performSearch({
          multipleRecordPickerInstanceId: INSTANCE_ID,
          forceAdditionalFilter: additionalFilter,
        });
      });

      // One query (no picked records → no including-picked query)
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: additionalFilter,
          }),
        }),
      );
    });

    it('should use additionalFilter from atom state when no forceAdditionalFilter provided', async () => {
      const storedFilter: ObjectRecordFilterInput = {
        not: { id: { in: ['parent-from-atom'] } },
      };
      store.set(
        multipleRecordPickerAdditionalFilterComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
        storedFilter,
      );

      const { result } = renderHook(() =>
        useMultipleRecordPickerPerformSearch(),
      );

      await act(async () => {
        await result.current.performSearch({
          multipleRecordPickerInstanceId: INSTANCE_ID,
        });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: storedFilter,
          }),
        }),
      );
    });

    it('should send undefined filter when no additionalFilter is set', async () => {
      const { result } = renderHook(() =>
        useMultipleRecordPickerPerformSearch(),
      );

      await act(async () => {
        await result.current.performSearch({
          multipleRecordPickerInstanceId: INSTANCE_ID,
        });
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            filter: undefined,
          }),
        }),
      );
    });
  });

  describe('additionalFilter combined with picked records', () => {
    const pickedRecordId = 'picked-company-1';

    beforeEach(() => {
      store.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: INSTANCE_ID,
        }),
        [
          {
            recordId: pickedRecordId,
            objectMetadataId: COMPANY_META_ID,
            isSelected: true,
            isMatchingSearchFilter: true,
          },
        ],
      );
    });

    it('should combine id-exclusion AND additionalFilter for the unselected query', async () => {
      const { result } = renderHook(() =>
        useMultipleRecordPickerPerformSearch(),
      );

      const additionalFilter: ObjectRecordFilterInput = {
        not: { id: { in: ['parent-1'] } },
      };

      await act(async () => {
        await result.current.performSearch({
          multipleRecordPickerInstanceId: INSTANCE_ID,
          forceAdditionalFilter: additionalFilter,
        });
      });

      // Two queries: one for unselected, one for already-picked
      expect(mockQuery).toHaveBeenCalledTimes(2);

      // Unselected query: id-exclusion AND additionalFilter combined
      const unselectedCall = mockQuery.mock.calls.find(
        (call) => call[0].variables?.filter?.and !== undefined,
      );
      expect(unselectedCall).toBeDefined();
      expect(unselectedCall[0].variables.filter).toEqual({
        and: [{ not: { id: { in: [pickedRecordId] } } }, additionalFilter],
      });
    });

    it('should NOT apply additionalFilter to the already-picked records query', async () => {
      const { result } = renderHook(() =>
        useMultipleRecordPickerPerformSearch(),
      );

      const additionalFilter: ObjectRecordFilterInput = {
        not: { id: { in: ['parent-1'] } },
      };

      await act(async () => {
        await result.current.performSearch({
          multipleRecordPickerInstanceId: INSTANCE_ID,
          forceAdditionalFilter: additionalFilter,
        });
      });

      // The including-picked query should only have the id-in filter
      const includingPickedCall = mockQuery.mock.calls.find(
        (call) => call[0].variables?.filter?.id?.in !== undefined,
      );
      expect(includingPickedCall).toBeDefined();
      expect(includingPickedCall[0].variables.filter).toEqual({
        id: { in: [pickedRecordId] },
      });
    });
  });
});
