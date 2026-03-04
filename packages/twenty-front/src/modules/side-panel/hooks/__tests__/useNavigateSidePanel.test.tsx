import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useNavigateSidePanel } from '@/command-menu/hooks/useNavigateSidePanel';
import { sidePanelNavigationStackState } from '@/command-menu/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/command-menu/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/command-menu/states/sidePanelPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { SidePanelPages } from 'twenty-shared/types';
import { Icon123, useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
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
      const { navigateCommandMenu } = useNavigateSidePanel();

      const { getIcon } = useIcons();

      return {
        navigateCommandMenu,
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
      result.current.navigateCommandMenu({
        page: SidePanelPages.Root,
        pageTitle: 'Root',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
        resetNavigationStack: false,
      });
    });

    expect(jotaiStore.get(sidePanelPageState.atom)).toBe(
      SidePanelPages.Root,
    );
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
