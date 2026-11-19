import { act, render, screen } from '@testing-library/react';

import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordTableSettingsFiltersInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsFiltersInitializeStateEffect';
import { RecordTableSettingsSortsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsInitializeStateEffect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { type View } from '@/views/types/View';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';

const INSTANCE_ID = 'record-table-settings-instance';

const DRAFT_VIEW_WITHOUT_FILTERS_OR_SORTS = {
  id: 'view-1',
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
} as unknown as View;

const STALE_FILTER = {
  id: 'stale-filter',
  label: 'Stale filter',
} as unknown as RecordFilter;

const JestWrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular: 'company',
});

const Harness = ({ isSubPageOpen }: { isSubPageOpen: boolean }) => {
  const [currentRecordFilters, setCurrentRecordFilters] = useAtomComponentState(
    currentRecordFiltersComponentState,
  );
  const [currentRecordSorts, setCurrentRecordSorts] = useAtomComponentState(
    currentRecordSortsComponentState,
  );

  return (
    <>
      <button onClick={() => setCurrentRecordFilters([STALE_FILTER])}>
        Leave a stale filter
      </button>
      <button
        onClick={() =>
          setCurrentRecordSorts([
            {
              id: 'stale-sort',
              fieldMetadataId: 'field-1',
              direction: ViewSortDirection.ASC,
            },
          ])
        }
      >
        Leave a stale sort
      </button>
      <span>{`Filters: ${currentRecordFilters.length}`}</span>
      <span>{`Sorts: ${currentRecordSorts.length}`}</span>
      {isSubPageOpen && (
        <>
          <RecordTableSettingsFiltersInitializeStateEffect
            view={DRAFT_VIEW_WITHOUT_FILTERS_OR_SORTS}
          />
          <RecordTableSettingsSortsInitializeStateEffect
            view={DRAFT_VIEW_WITHOUT_FILTERS_OR_SORTS}
          />
        </>
      )}
    </>
  );
};

const renderHarness = (isSubPageOpen: boolean) => (
  <JestWrapper>
    <RecordFiltersComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <Harness isSubPageOpen={isSubPageOpen} />
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </RecordFiltersComponentInstanceContext.Provider>
  </JestWrapper>
);

describe('RecordTableSettings initialize state effects', () => {
  it('reseeds filters and sorts from the draft when the sub-page opens, dropping discarded edits', () => {
    const { rerender } = render(renderHarness(false));

    act(() => {
      screen.getByRole('button', { name: 'Leave a stale filter' }).click();
      screen.getByRole('button', { name: 'Leave a stale sort' }).click();
    });

    expect(screen.getByText('Filters: 1')).toBeInTheDocument();
    expect(screen.getByText('Sorts: 1')).toBeInTheDocument();

    rerender(renderHarness(true));

    expect(screen.getByText('Filters: 0')).toBeInTheDocument();
    expect(screen.getByText('Sorts: 0')).toBeInTheDocument();
  });
});
