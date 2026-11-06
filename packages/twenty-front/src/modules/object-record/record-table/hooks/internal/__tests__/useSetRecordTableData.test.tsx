import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const instanceId = 'record-index-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <ViewComponentInstanceContext.Provider value={{ instanceId }}>
      {children}
    </ViewComponentInstanceContext.Provider>
  </JotaiProvider>
);

const setRecordGroup = ({
  recordGroupId,
  position,
}: {
  recordGroupId: string;
  position: number;
}) =>
  jotaiStore.set(recordGroupDefinitionFamilyState.atomFamily(recordGroupId), {
    id: recordGroupId,
    type: RecordGroupDefinitionType.Value,
    title: recordGroupId,
    value: recordGroupId,
    color: 'blue',
    position,
    isVisible: true,
  });

const getSelectedRecordIds = () =>
  jotaiStore.get(
    selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
  );

describe('useSetRecordTableData', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED,
          value: true,
        },
      ],
    });
    setRecordGroup({ recordGroupId: 'group-1', position: 0 });
    setRecordGroup({ recordGroupId: 'group-2', position: 1 });
    jotaiStore.set(recordGroupIdsComponentState.atomFamily({ instanceId }), [
      'group-1',
      'group-2',
    ]);
    jotaiStore.set(
      recordIndexViewTypeState.atomFamily({ instanceId }),
      ViewType.TABLE,
    );
    jotaiStore.set(
      selectedRecordGroupTabIdComponentState.atomFamily({ instanceId }),
      'group-1',
    );
    jotaiStore.set(
      hasUserSelectedAllRecordsComponentState.atomFamily({ instanceId }),
      true,
    );
  });

  it('should not select records loaded into a group hidden by tabs', () => {
    jotaiStore.set(
      recordIndexShouldDisplayGroupsAsTabsComponentState.atomFamily({
        instanceId,
      }),
      true,
    );

    const { result } = renderHook(
      () => useSetRecordTableData({ recordTableId: instanceId }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current({
        records: [{ id: 'record-1', __typename: 'Task' }],
        currentRecordGroupId: 'group-1',
      });
      result.current({
        records: [{ id: 'record-2', __typename: 'Task' }],
        currentRecordGroupId: 'group-2',
      });
    });

    expect(getSelectedRecordIds()).toEqual(['record-1']);
  });

  it('should select records loaded into every group when groups are sections', () => {
    const { result } = renderHook(
      () => useSetRecordTableData({ recordTableId: instanceId }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current({
        records: [{ id: 'record-1', __typename: 'Task' }],
        currentRecordGroupId: 'group-1',
      });
      result.current({
        records: [{ id: 'record-2', __typename: 'Task' }],
        currentRecordGroupId: 'group-2',
      });
    });

    expect(getSelectedRecordIds()).toEqual(['record-1', 'record-2']);
  });
});
