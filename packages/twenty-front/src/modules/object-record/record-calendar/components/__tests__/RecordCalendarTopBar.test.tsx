import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enUS } from 'date-fns/locale';
import { Temporal } from 'temporal-polyfill';

import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const mockSetRecordCalendarSelectedDate = jest.fn();
const mockSetRecordIndexCalendarLayout = jest.fn();
const mockUpdateCurrentView = jest.fn();
const mockUseAtomComponentState = jest.fn();
const mockUseAtomStateValue = jest.fn();
const mockUseRecordCalendarDaysRange = jest.fn();

jest.mock('@/localization/hooks/useDateTimeFormat', () => ({
  useDateTimeFormat: jest.fn(() => ({ timeZone: 'UTC' })),
}));
jest.mock(
  '@/object-record/record-calendar/hooks/useRecordCalendarDaysRange',
  () => ({
    useRecordCalendarDaysRange: (...args: unknown[]) =>
      mockUseRecordCalendarDaysRange(...args),
  }),
);
jest.mock(
  '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar',
  () => ({ DatePickerWithoutCalendar: () => null }),
);
jest.mock(
  '@/ui/input/components/internal/date/components/TimeZoneAbbreviation',
  () => ({
    TimeZoneAbbreviation: () => <span data-testid="time-zone" />,
  }),
);
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    options,
    value,
    onChange,
  }: {
    options: { label: string; value: ViewCalendarLayout }[];
    value: ViewCalendarLayout;
    onChange: (value: ViewCalendarLayout) => void;
  }) => (
    <select
      data-testid="layout-select"
      value={value}
      onChange={(event) => onChange(event.target.value as ViewCalendarLayout)}
    >
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock('@/ui/input/components/SelectControl', () => ({
  SelectControl: ({
    selectedOption,
  }: {
    selectedOption: { label: string };
  }) => <span data-testid="selected-date">{selectedOption.label}</span>,
}));
jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({ clickableComponent }: { clickableComponent: React.ReactNode }) =>
    clickableComponent,
}));
jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: jest.fn(() => ({ closeDropdown: jest.fn() })),
}));
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: jest.fn(() => 'calendar-id'),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: (...args: unknown[]) =>
    mockUseAtomComponentState(...args),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: (...args: unknown[]) => mockUseAtomStateValue(...args),
}));
jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: jest.fn(() => ({
    updateCurrentView: mockUpdateCurrentView,
  })),
}));
jest.mock('twenty-ui/input', () => ({
  Button: ({
    ariaLabel,
    onClick,
    title,
  }: {
    ariaLabel?: string;
    onClick: () => void;
    title?: string;
  }) => (
    <button aria-label={ariaLabel} onClick={onClick}>
      {title}
    </button>
  ),
}));

describe('RecordCalendarTopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAtomComponentState.mockImplementation((state: unknown) => {
      if (state === recordIndexCalendarLayoutComponentState) {
        return [ViewCalendarLayout.DAY, mockSetRecordIndexCalendarLayout];
      }

      if (state === recordCalendarSelectedDateComponentState) {
        return [
          Temporal.PlainDate.from('2026-07-15'),
          mockSetRecordCalendarSelectedDate,
        ];
      }

      return [undefined, jest.fn()];
    });
    mockUseAtomStateValue.mockReturnValue({
      locale: 'en-US',
      localeCatalog: enUS,
    });
    mockUseRecordCalendarDaysRange.mockReturnValue({
      firstDay: Temporal.PlainDate.from('2026-07-13'),
      lastDay: Temporal.PlainDate.from('2026-07-19'),
    });
  });

  it('shows Day, Week, and Month with the selected full date', () => {
    render(<RecordCalendarTopBar />);

    expect(screen.getByTestId('selected-date')).toHaveTextContent(
      'Wednesday, July 15, 2026',
    );
    expect(
      Array.from(
        screen.getByTestId('layout-select').querySelectorAll('option'),
      ).map((option) => option.textContent),
    ).toEqual(['Day', 'Week', 'Month']);
    expect(screen.getByTestId('time-zone')).toBeInTheDocument();
  });

  it('navigates the Day layout one day at a time', () => {
    render(<RecordCalendarTopBar />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous period' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next period' }));

    expect(mockSetRecordCalendarSelectedDate).toHaveBeenNthCalledWith(
      1,
      Temporal.PlainDate.from('2026-07-14'),
    );
    expect(mockSetRecordCalendarSelectedDate).toHaveBeenNthCalledWith(
      2,
      Temporal.PlainDate.from('2026-07-16'),
    );
  });

  it('persists a week selection from the top bar', async () => {
    const user = userEvent.setup();
    render(<RecordCalendarTopBar />);

    await user.selectOptions(screen.getByRole('combobox'), 'WEEK');

    expect(mockSetRecordIndexCalendarLayout).toHaveBeenCalledWith(
      ViewCalendarLayout.WEEK,
    );
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({
      calendarLayout: ViewCalendarLayout.WEEK,
    });
  });
});
