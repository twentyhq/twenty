import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));
jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));
jest.mock('@/object-record/record-index/hooks/useResolveOpenRecordIn', () => ({
  useResolveOpenRecordIn: () => 'RECORD_PAGE',
}));

const RECORD_INDEX_ID = 'record-index-id';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const recordFilter = (id: string): RecordFilter => ({
  id,
  fieldMetadataId: 'close-date-field-id',
  value: 'THIS_1_QUARTER',
  displayValue: 'This quarter',
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_RELATIVE,
  label: 'Close date',
});

const openRecordAndGetParentViewFilterIds = (
  excludedRecordFilterIds?: string[],
) => {
  jotaiStore.set(
    currentRecordFiltersComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    [recordFilter('own-period'), recordFilter('other')],
  );

  const { result } = renderHook(() => useOpenRecordFromIndexView(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={jotaiStore}>
        <RecordIndexContextProvider
          value={{
            indexIdentifierUrl: () => '',
            onIndexRecordsLoaded: () => {},
            objectNamePlural: opportunityObjectMetadataItem.namePlural,
            objectNameSingular: opportunityObjectMetadataItem.nameSingular,
            objectMetadataItem: opportunityObjectMetadataItem,
            objectPermissionsByObjectMetadataId: {},
            recordIndexId: RECORD_INDEX_ID,
            viewBarInstanceId: RECORD_INDEX_ID,
            recordFieldByFieldMetadataItemId: {},
            labelIdentifierFieldMetadataItem: undefined,
            fieldMetadataItemByFieldMetadataItemId: {},
            fieldDefinitionByFieldMetadataItemId: {},
            excludedRecordFilterIds,
          }}
        >
          {children}
        </RecordIndexContextProvider>
      </JotaiProvider>
    ),
  });

  act(() => {
    result.current.openRecordFromIndexView({ recordId: 'record-id' });
  });

  return jotaiStore
    .get(
      contextStoreRecordShowParentViewComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    )
    ?.parentViewFilters.map(({ id }) => id);
};

describe('useOpenRecordFromIndexView', () => {
  it('should pass every index filter to the record page navigation', () => {
    expect(openRecordAndGetParentViewFilterIds()).toEqual([
      'own-period',
      'other',
    ]);
  });

  it('should navigate without the filters the index leaves out of its queries', () => {
    expect(openRecordAndGetParentViewFilterIds(['own-period'])).toEqual([
      'other',
    ]);
  });
});
