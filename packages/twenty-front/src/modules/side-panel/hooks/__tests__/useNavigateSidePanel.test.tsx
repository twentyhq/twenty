import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { SidePanelPages } from 'twenty-shared/types';
import { Icon123, useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords: 0,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { navigateSidePanel } = useNavigateSidePanel();

      const { getIcon } = useIcons();

      return {
        navigateSidePanel,
        getIcon,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useNavigateSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to the correct page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.navigateSidePanel({
        page: SidePanelPages.Root,
        pageTitle: 'Root',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(SidePanelPages.Root);
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      {
        page: SidePanelPages.Root,
        pageTitle: 'Root',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
      },
    ]);
    expect(jotaiStore.get(sidePanelPageInfoState.atom)).toEqual({
      title: 'Root',
      Icon: Icon123,
      instanceId: 'mocked-uuid',
    });
  });
});
