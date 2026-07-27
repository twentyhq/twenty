import { render, screen } from '@testing-library/react';

import { RecordCalendar } from '@/object-record/record-calendar/components/RecordCalendar';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

jest.mock(
  '@/object-record/record-calendar/components/RecordCalendarTopBar',
  () => ({
    RecordCalendarTopBar: () => <div data-testid="calendar-top-bar" />,
  }),
);
jest.mock(
  '@/object-record/record-calendar/day/components/RecordCalendarDay',
  () => ({
    RecordCalendarDay: () => <div data-testid="calendar-day" />,
  }),
);
jest.mock(
  '@/object-record/record-calendar/month/components/RecordCalendarMonth',
  () => ({
    RecordCalendarMonth: () => <div data-testid="calendar-month" />,
  }),
);
jest.mock(
  '@/object-record/record-calendar/week/components/RecordCalendarWeek',
  () => ({
    RecordCalendarWeek: () => <div data-testid="calendar-week" />,
  }),
);
jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: jest.fn(() => 'calendar-id'),
  }),
);
jest.mock(
  '@/object-record/record-calendar/states/selectors/useRecordCalendarSelection',
  () => ({
    useRecordCalendarSelection: jest.fn(() => ({
      resetRecordSelection: jest.fn(),
    })),
  }),
);
jest.mock('@/ui/utilities/pointer-event/hooks/useListenClickOutside', () => ({
  useListenClickOutside: jest.fn(),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: jest.fn(),
  }),
);
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const useAtomComponentStateValueMock = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
).useAtomComponentStateValue;
const useIsFeatureEnabledMock = jest.requireMock(
  '@/workspace/hooks/useIsFeatureEnabled',
).useIsFeatureEnabled;

describe('RecordCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAtomComponentStateValueMock.mockReturnValue(ViewCalendarLayout.WEEK);
  });

  it.each([ViewCalendarLayout.DAY, ViewCalendarLayout.WEEK])(
    'renders month when a persisted %s layout is disabled',
    (calendarLayout) => {
      useAtomComponentStateValueMock.mockReturnValue(calendarLayout);
      useIsFeatureEnabledMock.mockReturnValue(false);

      render(<RecordCalendar />);

      expect(screen.getByTestId('calendar-month')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-day')).not.toBeInTheDocument();
      expect(screen.queryByTestId('calendar-week')).not.toBeInTheDocument();
      expect(useIsFeatureEnabledMock).toHaveBeenCalledWith(
        FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
      );
    },
  );

  it('renders day when the day layout is enabled', () => {
    useAtomComponentStateValueMock.mockReturnValue(ViewCalendarLayout.DAY);
    useIsFeatureEnabledMock.mockReturnValue(true);

    render(<RecordCalendar />);

    expect(screen.getByTestId('calendar-day')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-week')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-month')).not.toBeInTheDocument();
  });

  it('renders week when the week layout is enabled', () => {
    useIsFeatureEnabledMock.mockReturnValue(true);

    render(<RecordCalendar />);

    expect(screen.getByTestId('calendar-week')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-day')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-month')).not.toBeInTheDocument();
  });
});
