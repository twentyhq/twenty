import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INSTANCE_ID = 'instanceId';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const closeDateField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'closeDate',
});

const CLOSE_DATE_TODAY: RecordFilter = {
  id: 'close-date-today',
  fieldMetadataId: closeDateField.id,
  value: '',
  displayValue: '',
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_TODAY,
  label: 'Close date',
};

const buildRecordInput = (excludedRecordFilterIds?: string[]) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      onInitializeJotaiStore: (store) => {
        store.set(
          currentRecordFiltersComponentState.atomFamily({
            instanceId: INSTANCE_ID,
          }),
          [CLOSE_DATE_TODAY],
        );
      },
    });

  const { result } = renderHook(
    () =>
      useBuildRecordInputFromFilters({
        objectMetadataItem: opportunityObjectMetadataItem,
        instanceId: INSTANCE_ID,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JestMetadataAndApolloMocksWrapper>
          <RecordIndexContextProvider
            value={{
              indexIdentifierUrl: () => '',
              onIndexRecordsLoaded: () => {},
              objectNamePlural: opportunityObjectMetadataItem.namePlural,
              objectNameSingular: opportunityObjectMetadataItem.nameSingular,
              objectMetadataItem: opportunityObjectMetadataItem,
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
      ),
    },
  );

  return result.current.buildRecordInputFromFilters();
};

describe('useBuildRecordInputFromFilters', () => {
  it('should pre-fill a new record from the index filters', () => {
    expect(buildRecordInput()).toHaveProperty('closeDate');
  });

  it('should not pre-fill from a filter the index leaves out of its queries', () => {
    expect(buildRecordInput([CLOSE_DATE_TODAY.id])).not.toHaveProperty(
      'closeDate',
    );
  });
});
