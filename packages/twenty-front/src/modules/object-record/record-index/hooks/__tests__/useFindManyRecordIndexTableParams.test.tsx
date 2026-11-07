import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
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

const ADDITIONAL_FILTER = { name: { eq: 'Acme' } };

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

  it('should AND the additional filter of the surrounding record index', () => {
    const RecordGroupWrapper = getWrapper('unknown-record-group-id');

    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <RecordGroupWrapper>
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
                additionalFilter: ADDITIONAL_FILTER,
              }}
            >
              {children}
            </RecordIndexContextProvider>
          </RecordGroupWrapper>
        ),
      },
    );

    expect(result.current.filter).toEqual(ADDITIONAL_FILTER);
  });

  it('should not set a limit outside a record group', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      { wrapper: getWrapper('unknown-record-group-id') },
    );

    expect(result.current).not.toHaveProperty('limit');
  });
});
