import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
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
      const { navigateCommandMenu } = useNavigateCommandMenu();

      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuNavigationStack = useRecoilValue(
        commandMenuNavigationStackState,
      );
      const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);

      const { getIcon } = useIcons();

      return {
        navigateCommandMenu,
        commandMenuPage,
        commandMenuNavigationStack,
        commandMenuPageInfo,
        getIcon,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useNavigateCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to the correct page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.navigateCommandMenu({
        page: CommandMenuPages.Root,
        pageTitle: 'Root',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
        resetNavigationStack: false,
      });
    });

    expect(result.current.commandMenuPage).toBe(CommandMenuPages.Root);
    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'Root',
        pageIcon: Icon123,
        pageIconColor: 'red',
        pageId: 'mocked-uuid',
      },
    ]);
    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Root',
      Icon: Icon123,
      instanceId: 'mocked-uuid',
    });
  });
});
