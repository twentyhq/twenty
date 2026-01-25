import { act, renderHook } from '@testing-library/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { vi } from 'vitest';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const mockCreateActivity = vi.hoisted(() => vi.fn());
const mockCreateActivityTarget = vi.hoisted(() => vi.fn());
const mockOpenRecordInCommandMenu = vi.hoisted(() => vi.fn());

vi.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: vi.fn(
    ({ objectNameSingular }: { objectNameSingular: string }) => {
      if (objectNameSingular === 'note') {
        return { createOneRecord: mockCreateActivity };
      }
      if (objectNameSingular === 'noteTarget') {
        return { createOneRecord: mockCreateActivityTarget };
      }
      return { createOneRecord: vi.fn() };
    },
  ),
}));

vi.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: mockOpenRecordInCommandMenu,
  }),
}));

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const mockObjectMetadataItems = generatedMockObjectMetadataItems;

describe('useOpenCreateActivityDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateActivity.mockResolvedValue({ id: 'note-id' });
    mockCreateActivityTarget.mockResolvedValue({ id: 'note-target-id' });
  });

  it('works as expected', async () => {
    const { result } = renderHook(
      () => {
        const openActivityRightDrawer = useOpenCreateActivityDrawer({
          activityObjectNameSingular: CoreObjectNameSingular.Note,
        });
        const viewableRecordId = useRecoilValue(viewableRecordIdState);
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );
        return {
          openActivityRightDrawer,
          viewableRecordId,
          setObjectMetadataItems,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.setObjectMetadataItems(mockObjectMetadataItems);
    });

    expect(result.current.viewableRecordId).toBeNull();
    await act(async () => {
      result.current.openActivityRightDrawer({
        targetableObjects: [],
      });
    });
  });
});
