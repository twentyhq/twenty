import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import {
  AppPath,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateSidePanel = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

jest.mock('@/side-panel/routing/utils/isSidePanelRoutedLocation', () => ({
  isSidePanelRoutedLocation: () => true,
}));

const mockOpenNewRecordTitleCell = jest.fn();
jest.mock(
  '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell',
  () => ({
    useOpenNewRecordTitleCell: () => ({
      openNewRecordTitleCell: mockOpenNewRecordTitleCell,
    }),
  }),
);

const mockNavigateApp = jest.fn();
jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));

const calendarEventMockObjectMetadataItem =
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === CoreObjectNameSingular.CalendarEvent,
  )!;

const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    calendarEventMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords: 0,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(() => useOpenCalendarEventInSidePanel(), {
    wrapper,
  });
  return { result };
};

describe('useOpenCalendarEventInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the calendar event as a hosted record page', () => {
    const { result } = renderHooks();

    const calendarEventId = 'calendar-event-123';

    act(() => {
      result.current.openCalendarEventInSidePanel(calendarEventId);
    });

    const recordPath = getAppPath(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.CalendarEvent,
      objectRecordId: calendarEventId,
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.RoutedPage,
        pageTitle: recordPath,
        pageId: 'mocked-uuid',
        routedLocation: expect.objectContaining({
          pathname: recordPath,
          state: null,
        }),
      }),
    );
  });
});
