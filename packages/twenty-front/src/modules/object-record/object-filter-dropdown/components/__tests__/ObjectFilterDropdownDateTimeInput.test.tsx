import { render } from '@testing-library/react';
import { act } from 'react';
import { Temporal } from 'temporal-polyfill';

import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { ObjectFilterDropdownDateTimeInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownDateTimeInput';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { formatDateTimeString } from '@/object-record/record-field/ui/utils/formatDateTimeString';
import {
  UserContext,
  type UserContextType,
} from '@/users/contexts/UserContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
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

jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({
    userTimezone: 'America/New_York',
    isSystemTimezone: false,
    systemTimeZone: 'UTC',
  }),
}));

jest.mock('@/object-record/record-field/ui/utils/formatDateTimeString', () => ({
  formatDateTimeString: jest.fn(({ value }) => `formatted-${value}`),
}));

jest.mock(
  '@/views/view-filter-value/utils/stringifyRelativeDateFilter',
  () => ({
    stringifyRelativeDateFilter: jest.fn(() => 'stringified-relative-date'),
  }),
);

// biome-ignore lint/suspicious/noExplicitAny: testing prop capture
let lastDateTimePickerProps: any = null;
jest.mock(
  '@/ui/input/components/internal/date/components/DateTimePicker',
  () => ({
    // biome-ignore lint/suspicious/noExplicitAny: mock component
    DateTimePicker: (props: any) => {
      lastDateTimePickerProps = props;
      return <div data-testid="date-time-picker" />;
    },
  }),
);

const INSTANCE_ID = 'object-filter-dropdown-date-time-input-test';
const BaseWrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderWithUserContext = (userContextValue: Partial<UserContextType>) => {
  const fullContextValue: UserContextType = {
    dateFormat: DateFormat.SYSTEM,
    timeFormat: TimeFormat.SYSTEM,
    // biome-ignore lint/suspicious/noExplicitAny: intentional undefined for testing fallback
    timeZone: undefined as any,
    ...userContextValue,
  };

  return render(
    <BaseWrapper>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <UserContext.Provider value={fullContextValue}>
          <ObjectFilterDropdownDateTimeInput />
        </UserContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </BaseWrapper>,
  );
};

describe('ObjectFilterDropdownDateTimeInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastDateTimePickerProps = null;
  });

  it('falls back to userTimezone when timeZone is unset on absolute date change', () => {
    renderWithUserContext({ timeZone: undefined });

    const zonedDateTime = Temporal.ZonedDateTime.from(
      '2026-10-25T14:30:00[America/New_York]',
    );

    act(() => {
      lastDateTimePickerProps.onChange(zonedDateTime);
    });

    expect(formatDateTimeString).toHaveBeenCalledWith(
      expect.objectContaining({
        timeZone: 'America/New_York',
      }),
    );
  });

  it('uses explicitly provided timeZone over userTimezone fallback on absolute date change', () => {
    renderWithUserContext({ timeZone: 'Europe/Paris' });

    const zonedDateTime = Temporal.ZonedDateTime.from(
      '2026-10-25T14:30:00[Europe/Paris]',
    );

    act(() => {
      lastDateTimePickerProps.onChange(zonedDateTime);
    });

    expect(formatDateTimeString).toHaveBeenCalledWith(
      expect.objectContaining({
        timeZone: 'Europe/Paris',
      }),
    );
  });

  it('falls back to userTimezone when timeZone is unset on relative date change', () => {
    renderWithUserContext({ timeZone: undefined });

    act(() => {
      lastDateTimePickerProps.onRelativeDateChange({
        direction: 'PAST',
        amount: 3,
        unit: 'DAYS',
      });
    });

    expect(stringifyRelativeDateFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        timezone: 'America/New_York',
      }),
    );
  });
});
