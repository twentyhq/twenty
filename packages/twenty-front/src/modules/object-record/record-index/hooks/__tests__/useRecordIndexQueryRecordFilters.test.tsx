import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexQueryRecordFilters } from '@/object-record/record-index/hooks/useRecordIndexQueryRecordFilters';
import { ViewFilterOperand } from 'twenty-shared/types';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INSTANCE_ID = 'instanceId';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const recordFilter = (id: string): RecordFilter => ({
  id,
  fieldMetadataId: 'created-at-field-id',
  value: '',
  displayValue: '',
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_TODAY,
  label: 'Creation date',
});

const RECORD_FILTERS = [recordFilter('own-period'), recordFilter('other')];

const getWrapper = (excludedRecordFilterIds?: string[]) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      onInitializeJotaiStore: (store) => {
        store.set(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: INSTANCE_ID,
          }),
          RECORD_FILTERS,
        );
      },
    });

  return ({ children }: { children: ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
      <RecordIndexContextProvider
        value={{
          indexIdentifierUrl: () => '',
          onIndexRecordsLoaded: () => {},
          objectNamePlural: companyObjectMetadataItem.namePlural,
          objectNameSingular: companyObjectMetadataItem.nameSingular,
          objectMetadataItem: companyObjectMetadataItem,
          objectPermissionsByObjectMetadataId: {},
          recordIndexId: INSTANCE_ID,
          viewBarInstanceId: INSTANCE_ID,
          recordFieldByFieldMetadataItemId: {},
          labelIdentifierFieldMetadataItem: undefined,
          fieldMetadataItemByFieldMetadataItemId: {},
          fieldDefinitionByFieldMetadataItemId: {},
          excludedRecordFilterIds,
        }}
      >
        {children}
      </RecordIndexContextProvider>
    </JestMetadataAndApolloMocksWrapper>
  );
};

describe('useRecordIndexQueryRecordFilters', () => {
  it('should query the index filters as they are without exclusions', () => {
    const { result } = renderHook(
      () => useRecordIndexQueryRecordFilters(INSTANCE_ID),
      { wrapper: getWrapper() },
    );

    expect(result.current.recordFilters).toBe(RECORD_FILTERS);
  });

  it('should leave the excluded filters out of queries only', () => {
    const { result } = renderHook(
      () => ({
        queried: useRecordIndexQueryRecordFilters(INSTANCE_ID),
        indexState: useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          INSTANCE_ID,
        ),
      }),
      { wrapper: getWrapper(['own-period']) },
    );

    expect(result.current.queried.recordFilters.map(({ id }) => id)).toEqual([
      'other',
    ]);
    expect(result.current.indexState.map(({ id }) => id)).toEqual([
      'own-period',
      'other',
    ]);
  });
});
