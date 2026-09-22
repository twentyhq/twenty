import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INSTANCE_ID = 'instanceId';
const RECORD_GROUP_ID = 'record-group-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const groupByFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const getWrapper = (recordGroupId: string) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      onInitializeJotaiStore: (store) => {
        store.set(
          recordIndexGroupLoadLimitComponentState.atomFamily({
            instanceId: INSTANCE_ID,
          }),
          50,
        );
        store.set(
          recordIndexGroupFieldMetadataItemComponentState.atomFamily({
            instanceId: INSTANCE_ID,
          }),
          groupByFieldMetadataItem,
        );
        store.set(
          recordGroupDefinitionFamilyState.atomFamily(RECORD_GROUP_ID),
          {
            id: RECORD_GROUP_ID,
            type: RecordGroupDefinitionType.Value,
            title: 'Acme',
            value: 'Acme',
            color: 'blue',
            position: 0,
            isVisible: true,
          },
        );
      },
    });

  return ({ children }: { children: ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
      <RecordGroupContext.Provider value={{ recordGroupId }}>
        {children}
      </RecordGroupContext.Provider>
    </JestMetadataAndApolloMocksWrapper>
  );
};

describe('useFindManyRecordIndexTableParams', () => {
  it('should query a record group with the view group load limit', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      { wrapper: getWrapper(RECORD_GROUP_ID) },
    );

    expect(result.current.limit).toBe(50);
  });

  it('should not set a limit when the view is not grouped', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      { wrapper: getWrapper('unknown-record-group-id') },
    );

    expect(result.current).not.toHaveProperty('limit');
  });
});
