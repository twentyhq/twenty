import { act, renderHook } from '@testing-library/react';

import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import {
  mockedCoreViewsData,
  mockedViewsData,
} from '~/testing/mock-data/views';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useApplyCurrentViewSortsToCurrentRecordSorts } from '@/views/hooks/useApplyCurrentViewSortsToCurrentRecordSorts';

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

  afterEach(() => {
    resetJotaiStore();
  });

  const mockFieldMetadataItem = mockObjectMetadataItem.fields.find(
    (field) => field.name === 'name',
  );

  if (!isDefined(mockFieldMetadataItem)) {
    throw new Error('Missing mock field metadata item with type TEXT');
  }

  const mockViewSort: CoreViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: mockFieldMetadataItem.id,
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  const allCompaniesView = mockedViewsData[0];
  const allCompaniesCoreView = mockedCoreViewsData[0];

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
    jotaiStore.set(coreViewsState.atom, [mockCoreView]);

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
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
          apolloMocks: [],
          componentInstanceId: 'instanceId',
          contextStoreCurrentObjectMetadataNameSingular:
            mockObjectMetadataItemNameSingular,
          contextStoreCurrentViewId: mockView.id,
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
    jotaiStore.set(coreViewsState.atom, []);

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
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
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

    jotaiStore.set(coreViewsState.atom, [viewWithNoSorts]);

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
        wrapper: getJestMetadataAndApolloMocksAndActionMenuWrapper({
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
});
