import { render } from '@testing-library/react';
import { act } from 'react';
import { Temporal } from 'temporal-polyfill';

import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { ObjectFilterDropdownDateInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateInput';
import { ObjectFilterDropdownDateTimeInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateTimeInput';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import {
  UserContext,
  type UserContextType,
} from '@/users/contexts/UserContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockApplyObjectFilterDropdownFilterValue = jest.fn();
jest.mock(
  '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue',
  () => ({
    useApplyObjectFilterDropdownFilterValue: () => ({
      applyObjectFilterDropdownFilterValue:
        mockApplyObjectFilterDropdownFilterValue,
    }),
  }),
);

// A distinctive UTC+14 zone so a fallback to UTC or to the browser zone
// moves the rendered date across a day boundary and cannot pass by luck.
jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'Pacific/Kiritimati',
    isSystemTimezone: false,
    systemTimeZone: 'UTC',
  }),
}));

type CapturedPickerProps = {
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onRelativeDateChange?: (relativeDate: unknown) => void;
};

let capturedDateTimePickerProps: CapturedPickerProps = {};
jest.mock(
  '@/ui/input/components/internal/date/components/DateTimePicker',
  () => ({
    DateTimePicker: (props: CapturedPickerProps) => {
      capturedDateTimePickerProps = props;
      return <div data-testid="date-time-picker" />;
    },
  }),
);

let capturedDatePickerProps: CapturedPickerProps = {};
jest.mock('@/ui/input/components/internal/date/components/DatePicker', () => ({
  DatePicker: (props: CapturedPickerProps) => {
    capturedDatePickerProps = props;
    return <div data-testid="date-picker" />;
  },
}));

const INSTANCE_ID = 'object-filter-dropdown-date-timezone-test';
const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderWithUserContext = (
  Component: () => JSX.Element,
  userContextValue: Partial<UserContextType>,
) => {
  const fullContextValue = {
    dateFormat: DateFormat.DAY_FIRST,
    timeFormat: TimeFormat.HOUR_24,
    ...userContextValue,
  } as UserContextType;

  return render(
    <BaseWrapper>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <UserContext.Provider value={fullContextValue}>
          <Component />
        </UserContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </BaseWrapper>,
  );
};

// 2026-01-14T22:30:00Z is still Jan 14 in UTC and America/New_York,
// but already Jan 15 in Pacific/Kiritimati (UTC+14).
const BOUNDARY_INSTANT = Temporal.Instant.from('2026-01-14T22:30:00Z');

describe('ObjectFilterDropdownDateTimeInput timezone fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedDateTimePickerProps = {};
    capturedDatePickerProps = {};
  });

  it('formats an absolute date change in the workspace timezone when the field timezone is unset', () => {
    renderWithUserContext(ObjectFilterDropdownDateTimeInput, {
      timeZone: undefined as unknown as string,
    });

    act(() => {
      capturedDateTimePickerProps.onChange?.(
        BOUNDARY_INSTANT.toZonedDateTimeISO('UTC'),
      );
    });

    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledTimes(1);
    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledWith(
      '2026-01-14T22:30:00Z',
      '15 Jan, 2026 12:30',
    );
  });

  it('prefers an explicitly set field timezone over the workspace timezone', () => {
    renderWithUserContext(ObjectFilterDropdownDateTimeInput, {
      timeZone: 'America/New_York',
    });

    act(() => {
      capturedDateTimePickerProps.onChange?.(
        BOUNDARY_INSTANT.toZonedDateTimeISO('UTC'),
      );
    });

    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledTimes(1);
    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledWith(
      '2026-01-14T22:30:00Z',
      '14 Jan, 2026 17:30',
    );
  });

  it('stores the workspace timezone in a relative date filter when the field timezone is unset', () => {
    renderWithUserContext(ObjectFilterDropdownDateTimeInput, {
      timeZone: undefined as unknown as string,
    });

    act(() => {
      capturedDateTimePickerProps.onRelativeDateChange?.({
        direction: 'PAST',
        amount: 3,
        unit: 'DAY',
      });
    });

    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledTimes(1);
    const [filterValue] =
      mockApplyObjectFilterDropdownFilterValue.mock.calls[0];
    expect(filterValue).toContain('PAST_3_DAY');
    expect(filterValue).toContain(';;Pacific/Kiritimati;;');
  });

  it('stores the workspace timezone in a date-only relative filter when the field timezone is unset', () => {
    renderWithUserContext(ObjectFilterDropdownDateInput, {
      timeZone: undefined as unknown as string,
    });

    act(() => {
      capturedDatePickerProps.onRelativeDateChange?.({
        direction: 'PAST',
        amount: 3,
        unit: 'DAY',
      });
    });

    expect(mockApplyObjectFilterDropdownFilterValue).toHaveBeenCalledTimes(1);
    const [filterValue] =
      mockApplyObjectFilterDropdownFilterValue.mock.calls[0];
    expect(filterValue).toContain('PAST_3_DAY');
    expect(filterValue).toContain(';;Pacific/Kiritimati;;');
  });
});
