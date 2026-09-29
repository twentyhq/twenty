import { renderHook } from '@testing-library/react';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { useAreViewFiltersDifferentFromRecordFilters } from '@/views/hooks/useAreViewFiltersDifferentFromRecordFilters';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const mockObjectMetadataItemNameSingular = 'company';

describe('useAreViewFiltersDifferentFromRecordFilters', () => {
  const mockObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === mockObjectMetadataItemNameSingular,
  );

  if (!isDefined(mockObjectMetadataItem)) {
    throw new Error(
      'Missing mock object metadata item with name singular "company"',
    );
  }

  beforeEach(() => {
    resetJotaiStore();
  });

  const allCompaniesViewData = mockedViews.find(
    (view) => view.name === 'All Companies',
  )!;

  const mockViewWithRelations = {
    ...allCompaniesViewData,
    viewFilters: [],
  } satisfies ViewWithRelations;

  const mockFieldMetadataItem = mockObjectMetadataItem.fields[0];

  const buildRecordFilter = (id: string): RecordFilter => ({
    id,
    fieldMetadataId: mockFieldMetadataItem.id,
    value: 'test',
    displayValue: 'test',
    type: 'TEXT',
    operand: ViewFilterOperand.CONTAINS,
    label: mockFieldMetadataItem.label,
  });

  const renderWithRecordFilters = (recordFilters: RecordFilter[]) => {
    const MetadataWrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
      apolloMocks: [],
      componentInstanceId: 'instanceId',
      contextStoreCurrentObjectMetadataNameSingular:
        mockObjectMetadataItemNameSingular,
      contextStoreCurrentViewId: allCompaniesViewData.id,
      onInitializeJotaiStore: (store) => {
        setTestViewsInMetadataStore(store, [mockViewWithRelations]);
        store.set(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: 'instanceId',
          }),
          recordFilters,
        );
      },
    });

    return renderHook(() => useAreViewFiltersDifferentFromRecordFilters(), {
      wrapper: ({ children }) => (
        <MetadataWrapper>
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: 'instanceId' }}
          >
            {children}
          </RecordFiltersComponentInstanceContext.Provider>
        </MetadataWrapper>
      ),
    });
  };

  it('ignores the All/Mine toggle filter', () => {
    const { result } = renderWithRecordFilters([
      buildRecordFilter(TOGGLE_MINE_RECORD_FILTER_ID),
    ]);

    expect(result.current.viewFiltersAreDifferentFromRecordFilters).toBe(false);
  });

  it('still detects other unsaved filters next to the toggle filter', () => {
    const { result } = renderWithRecordFilters([
      buildRecordFilter(TOGGLE_MINE_RECORD_FILTER_ID),
      buildRecordFilter('unsaved-filter-id'),
    ]);

    expect(result.current.viewFiltersAreDifferentFromRecordFilters).toBe(true);
  });
});
