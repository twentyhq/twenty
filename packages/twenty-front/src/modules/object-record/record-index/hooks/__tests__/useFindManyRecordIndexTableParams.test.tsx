import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { ViewType } from '@/views/types/ViewType';
import { FeatureFlagKey } from 'twenty-shared/types';
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

const getWrapper = ({
  recordGroupId,
  shouldDisplayGroupsAsTabs = false,
}: {
  recordGroupId: string;
  shouldDisplayGroupsAsTabs?: boolean;
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
          recordIndexShouldDisplayGroupsAsTabsComponentState.atomFamily({
            instanceId: INSTANCE_ID,
          }),
          shouldDisplayGroupsAsTabs,
        );
        store.set(
          recordIndexViewTypeState.atomFamily({ instanceId: INSTANCE_ID }),
          ViewType.TABLE,
        );
        store.set(
          recordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
          [RECORD_GROUP_ID],
        );
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

  it('should not set a limit when record groups are displayed as tabs', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      {
        wrapper: getWrapper({
          recordGroupId: RECORD_GROUP_ID,
          shouldDisplayGroupsAsTabs: true,
        }),
      },
    );

    expect(result.current).not.toHaveProperty('limit');
  });

  it('should not set a limit outside a record group', () => {
    const { result } = renderHook(
      () => useFindManyRecordIndexTableParams('company', INSTANCE_ID),
      { wrapper: getWrapper({ recordGroupId: 'unknown-record-group-id' }) },
    );

    expect(result.current).not.toHaveProperty('limit');
  });
});
