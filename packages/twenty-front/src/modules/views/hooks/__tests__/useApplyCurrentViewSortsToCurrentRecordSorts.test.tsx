import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { useApplyCurrentViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyCurrentViewSortsToCurrentRecordSorts';
import { type ViewSortEssential } from '@/views/types/ViewSortEssential';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewSortsToCurrentRecordSorts', () => {
  const mockObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  const mockFieldMetadataItem = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  if (!isDefined(mockFieldMetadataItem)) {
    throw new Error('Missing mock field metadata item with type TEXT');
  }

  const mockViewSort: ViewSort = {
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  const allCompaniesViewData = mockedViews.find(
    (v) => v.name === 'All Companies',
  )!;
  const allCompaniesView = allCompaniesViewData as unknown as View;

  const mockViewSortData: ViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  const mockView = {
    ...allCompaniesView,
    viewSorts: [mockViewSort],
  } satisfies View;

  const mockViewWithRelations = {
    ...allCompaniesViewData,
    viewSorts: [mockViewSortData],
  } satisfies ViewWithRelations;

  it('should apply sorts from current view', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentRecordSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          contextStoreCurrentViewId: mockView.id,
          onInitializeJotaiStore: (store) => {
            setTestViewsInMetadataStore(store, [mockViewWithRelations]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        id: mockViewSort.id,
        fieldMetadataId: mockViewSort.fieldMetadataId,
        direction: mockViewSort.direction,
      },
    ]);
  });

  it('should not apply sorts when current view is not found', () => {
    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentRecordSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            store.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentRecordSorts).toEqual([]);
  });

  it('should handle view with empty sorts', () => {
    const viewWithNoSorts = {
      ...mockViewWithRelations,
      viewSorts: [],
    };

    const { result } = renderHook(
      () => {
        const { applyCurrentViewSortsToCurrentRecordSorts } =
          useApplyCurrentViewSortsToCurrentRecordSorts();

        const currentRecordSorts = useAtomComponentStateValue(
          currentRecordSortsComponentState,
          'recordIndexId',
        );

        return {
          applyCurrentViewSortsToCurrentRecordSorts,
          currentRecordSorts,
        };
      },
      {
        wrapper: getJestMetadataAndApolloMocksAndCommandMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          onInitializeJotaiStore: (store) => {
            setTestViewsInMetadataStore(store, [viewWithNoSorts]);
            store.set(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: 'instanceId',
              }),
              mockView.id,
            );
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentRecordSorts).toEqual([]);
  });
});
