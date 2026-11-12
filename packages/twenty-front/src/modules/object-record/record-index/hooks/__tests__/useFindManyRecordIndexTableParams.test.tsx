import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { ViewType } from '@/views/types/ViewType';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const INSTANCE_ID = 'instanceId';
const RECORD_GROUP_ID = 'record-group-id';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const groupByFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const stageFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'stage',
});

const getWrapper = ({
  recordGroupId,
  selectedRecordIndexTabId,
}: {
  recordGroupId: string;
  selectedRecordIndexTabId?: string;
}) => {
  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      onInitializeJotaiStore: (store) => {
        store.set(currentWorkspaceState.atom, {
          ...mockCurrentWorkspace,
          featureFlags: [
            { key: FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED, value: true },
          ],
        });
        store.set(
          recordIndexViewTypeState.atomFamily({ instanceId: INSTANCE_ID }),
          ViewType.TABLE,
        );
        if (isDefined(selectedRecordIndexTabId)) {
          store.set(
            recordIndexTabFieldMetadataItemComponentState.atomFamily({
              instanceId: INSTANCE_ID,
            }),
            stageFieldMetadataItem,
          );
          store.set(
            selectedRecordIndexTabIdComponentState.atomFamily({
              instanceId: INSTANCE_ID,
            }),
            selectedRecordIndexTabId,
          );
        }
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
      { wrapper: getWrapper({ recordGroupId: RECORD_GROUP_ID }) },
    );

    expect(result.current.limit).toBe(50);
  });

  it('should narrow the query to the active tab', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('opportunity', INSTANCE_ID),
      {
        wrapper: getWrapper({
          recordGroupId: 'unknown-record-group-id',
          selectedRecordIndexTabId: 'MEETING',
        }),
      },
    );

    expect(result.current.filter).toEqual({ stage: { in: ['MEETING'] } });
  });

  it('should not narrow the query on the All tab', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('opportunity', INSTANCE_ID),
      {
        wrapper: getWrapper({
          recordGroupId: 'unknown-record-group-id',
          selectedRecordIndexTabId: RECORD_INDEX_ALL_TAB_ID,
        }),
      },
    );

    expect(result.current.filter).toEqual({});
  });

  it('should not set a limit outside a record group', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      { wrapper: getWrapper({ recordGroupId: 'unknown-record-group-id' }) },
    );

    expect(result.current).not.toHaveProperty('limit');
  });
});
