import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useOpenCalendarEventInCommandMenu } from '@/command-menu/hooks/useOpenCalendarEventInCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { IconCalendarEvent } from 'twenty-ui/display';
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
      const { openCalendarEventInCommandMenu } =
        useOpenCalendarEventInCommandMenu();

      const viewableRecordId = useRecoilComponentValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );

      return {
        openCalendarEventInCommandMenu,
        viewableRecordId,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useOpenCalendarEventInCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the calendar event page', () => {
    const { result } = renderHooks();

    const calendarEventId = 'calendar-event-123';

    act(() => {
      result.current.openCalendarEventInCommandMenu(calendarEventId);
    });

    expect(result.current.viewableRecordId).toBe(calendarEventId);

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.ViewCalendarEvent,
      pageTitle: 'Calendar Event',
      pageIcon: IconCalendarEvent,
      pageId: 'mocked-uuid',
    });
  });
});
