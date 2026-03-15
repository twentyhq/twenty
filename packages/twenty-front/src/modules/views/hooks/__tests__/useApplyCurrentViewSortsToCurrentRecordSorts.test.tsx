import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { useApplyCurrentViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyCurrentViewSortsToCurrentRecordSorts';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { type ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { mockedCoreViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { setTestCoreViewsInMetadataStore } from '~/testing/utils/setTestCoreViewsInMetadataStore';

const mockObjectMetadataItemNameSingular = 'company';

describe('useApplyCurrentViewSortsToCurrentRecordSorts', () => {
  const mockObjectMetadataItem = generatedMockObjectMetadataItems.find(
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
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  const allCompaniesCoreView = mockedCoreViews.find(
    (v) => v.name === 'All Companies',
  )!;
  const allCompaniesView = allCompaniesCoreView as unknown as View;

  const mockCoreViewSort: CoreViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  const mockView = {
    ...allCompaniesView,
    viewSorts: [mockViewSort],
  } satisfies View;

  const mockCoreView = {
    ...allCompaniesCoreView,
    viewSorts: [mockCoreViewSort],
  } satisfies CoreViewWithRelations;

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
            setTestCoreViewsInMetadataStore(store, [mockCoreView]);
          },
        }),
      },
    );

    act(() => {
      result.current.applyCurrentViewSortsToCurrentRecordSorts();
    });

    expect(result.current.currentRecordSorts).toEqual([
      {
        __typename: 'ViewSort',
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
      ...mockCoreView,
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
            setTestCoreViewsInMetadataStore(store, [viewWithNoSorts]);
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
