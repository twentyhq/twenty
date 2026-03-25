import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateSidePanel = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

const personMockObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
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
      const { openCalendarEventInSidePanel } =
        useOpenCalendarEventInSidePanel();

      const viewableRecordId = useAtomComponentStateValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );

      return {
        openCalendarEventInSidePanel,
        viewableRecordId,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useOpenCalendarEventInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the calendar event page', () => {
    const { result } = renderHooks();

    const calendarEventId = 'calendar-event-123';

    act(() => {
      result.current.openCalendarEventInSidePanel(calendarEventId);
    });

    expect(result.current.viewableRecordId).toBe(calendarEventId);

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.ViewCalendarEvent,
      pageTitle: 'Calendar Event',
      pageIcon: IconCalendarEvent,
      pageId: 'mocked-uuid',
    });
  });
});
