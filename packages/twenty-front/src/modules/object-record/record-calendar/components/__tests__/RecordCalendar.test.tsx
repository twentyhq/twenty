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
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.fn(),
}));
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const useAtomStateValueMock = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomStateValue',
).useAtomStateValue;
const useIsFeatureEnabledMock = jest.requireMock(
  '@/workspace/hooks/useIsFeatureEnabled',
).useIsFeatureEnabled;

describe('RecordCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAtomStateValueMock.mockReturnValue(ViewCalendarLayout.WEEK);
  });

  it('renders month when a persisted week layout is disabled', () => {
    useIsFeatureEnabledMock.mockReturnValue(false);

    render(<RecordCalendar />);

    expect(screen.getByTestId('calendar-month')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-week')).not.toBeInTheDocument();
    expect(useIsFeatureEnabledMock).toHaveBeenCalledWith(
      FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
    );
  });

  it('renders week when the week layout is enabled', () => {
    useIsFeatureEnabledMock.mockReturnValue(true);

    render(<RecordCalendar />);

    expect(screen.getByTestId('calendar-week')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-month')).not.toBeInTheDocument();
  });
});
