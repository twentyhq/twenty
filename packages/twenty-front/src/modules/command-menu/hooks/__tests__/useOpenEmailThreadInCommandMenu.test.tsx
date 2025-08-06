import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useOpenEmailThreadInCommandMenu } from '@/command-menu/hooks/useOpenEmailThreadInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { IconMail } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateCommandMenu = jest.fn();
jest.mock('@/command-menu/hooks/useNavigateCommandMenu', () => ({
  useNavigateCommandMenu: () => ({
    navigateCommandMenu: mockNavigateCommandMenu,
  }),
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
      const { openEmailThreadInCommandMenu } =
        useOpenEmailThreadInCommandMenu();

      const viewableRecordId = useRecoilComponentValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );

      return {
        openEmailThreadInCommandMenu,
        viewableRecordId,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useOpenEmailThreadInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the email thread page', () => {
    const { result } = renderHooks();

    const emailThreadId = 'email-thread-123';

    act(() => {
      result.current.openEmailThreadInCommandMenu(emailThreadId);
    });

    expect(result.current.viewableRecordId).toBe(emailThreadId);

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.ViewEmailThread,
      pageTitle: 'Email Thread',
      pageIcon: IconMail,
      pageId: 'mocked-uuid',
    });
  });
});
