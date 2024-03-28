import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue, useSetRecoilState } from 'recoil';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';

const useOpenCreateActivityDrawerMock = jest.fn();
jest.mock('@/activities/hooks/useOpenCreateActivityDrawer', () => ({
  useOpenCreateActivityDrawer: jest.fn(),
}));

(useOpenCreateActivityDrawer as jest.Mock).mockImplementation(
  () => useOpenCreateActivityDrawerMock,
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();
const recordTableId = 'recordTableId';
const tableRowIds = ['123', '456'];
const recordObject = {
  id: '789',
};

describe('useOpenCreateActivityDrawerForSelectedRowIds', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => {
        const openCreateActivityDrawerForSelectedRowIds =
          useOpenCreateActivityDrawerForSelectedRowIds(recordTableId);
        const viewableActivityId = useRecoilValue(viewableActivityIdState);
        const activityIdInDrawer = useRecoilValue(activityIdInDrawerState);
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );
        const scopeId = `${recordTableId}-scope`;
        const setTableRowIds = useSetRecoilState(
          tableRowIdsComponentState({ scopeId }),
        );
        const setIsRowSelectedComponentFamilyState = useSetRecoilState(
          isRowSelectedComponentFamilyState({
            scopeId,
            familyKey: tableRowIds[0],
          }),
        );
        const setRecordStoreFamilyState = useSetRecoilState(
          recordStoreFamilyState(tableRowIds[0]),
        );
        return {
          openCreateActivityDrawerForSelectedRowIds,
          activityIdInDrawer,
          viewableActivityId,
          setObjectMetadataItems,
          setTableRowIds,
          setIsRowSelectedComponentFamilyState,
          setRecordStoreFamilyState,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.setTableRowIds(tableRowIds);
      result.current.setRecordStoreFamilyState(recordObject);
      result.current.setIsRowSelectedComponentFamilyState(true);
      result.current.setObjectMetadataItems(mockObjectMetadataItems);
    });

    expect(result.current.activityIdInDrawer).toBeNull();
    expect(result.current.viewableActivityId).toBeNull();
    await act(async () => {
      result.current.openCreateActivityDrawerForSelectedRowIds(
        'Note',
        'person',
        [{ id: '176', targetObjectNameSingular: 'person' }],
      );
    });

    expect(useOpenCreateActivityDrawerMock).toHaveBeenCalledWith({
      type: 'Note',
      targetableObjects: [
        {
          type: 'Custom',
          targetObjectNameSingular: 'person',
          id: '123',
          targetObjectRecord: { id: '789' },
        },
        {
          id: '176',
          targetObjectNameSingular: 'person',
        },
      ],
    });
  });
});
