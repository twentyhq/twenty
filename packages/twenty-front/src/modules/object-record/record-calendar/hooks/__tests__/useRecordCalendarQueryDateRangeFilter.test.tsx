import { useRecordCalendarQueryDateRangeFilter } from '@/object-record/record-calendar/hooks/useRecordCalendarQueryDateRangeFilter';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { renderHook } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';
import {
  FieldMetadataType,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

const mockCalendarField = {
  id: 'calendar-field',
  name: 'scheduledAt',
  type: FieldMetadataType.DATE_TIME,
};
let mockLayout = ViewCalendarLayout.DAY;

jest.mock(
  '@/object-record/record-calendar/contexts/RecordCalendarContext',
  () => ({
    useRecordCalendarContextOrThrow: () => ({
      objectMetadataItem: { fields: [mockCalendarField] },
      viewBarInstanceId: 'view-id',
    }),
  }),
);
jest.mock('@/ui/input/components/internal/date/hooks/useUserTimezone', () => ({
  useUserTimezone: () => ({ userTimezone: 'America/Los_Angeles' }),
}));
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({ filterValueDependencies: {} }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) => {
      if (state === recordIndexCalendarFieldMetadataIdComponentState)
        return mockCalendarField.id;
      if (state === recordIndexCalendarLayoutComponentState) return mockLayout;
      return [];
    },
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => {
  const { enUS } = jest.requireActual('date-fns/locale');
  return {
    useAtomStateValue: () => ({ calendarStartDay: 1, localeCatalog: enUS }),
  };
});
jest.mock('twenty-shared/utils', () => ({
  ...jest.requireActual('twenty-shared/utils'),
  computeRecordGqlOperationFilter: () => ({ status: { eq: 'OPEN' } }),
  turnAnyFieldFilterIntoRecordGqlFilter: () => ({
    recordGqlOperationFilter: { name: { ilike: '%Acme%' } },
  }),
}));

const getFilter = (selectedDate = '2026-03-08') =>
  renderHook(() =>
    useRecordCalendarQueryDateRangeFilter(
      Temporal.PlainDate.from(selectedDate),
    ),
  ).result.current.dateRangeFilter;

const withViewFilters = (gte: string, lt: string) => ({
  and: [
    { scheduledAt: { gte } },
    { scheduledAt: { lt } },
    { status: { eq: 'OPEN' } },
    { name: { ilike: '%Acme%' } },
  ],
});

describe('useRecordCalendarQueryDateRangeFilter', () => {
  beforeEach(() => {
    mockCalendarField.type = FieldMetadataType.DATE_TIME;
    mockLayout = ViewCalendarLayout.DAY;
  });

  it.each([
    [ViewCalendarLayout.DAY, '2026-03-08T08:00:00Z', '2026-03-09T07:00:00Z'],
    [ViewCalendarLayout.WEEK, '2026-03-02T08:00:00Z', '2026-03-09T07:00:00Z'],
    [ViewCalendarLayout.MONTH, '2026-02-23T08:00:00Z', '2026-04-06T07:00:00Z'],
  ])(
    'queries the %s grid across DST with separate bounds and preserves view/search filters',
    (layout, gte, lt) => {
      mockLayout = layout;
      expect(getFilter()).toEqual(withViewFilters(gte, lt));
    },
  );

  it('uses plain dates without shifting Date fields by the timezone', () => {
    mockCalendarField.type = FieldMetadataType.DATE;
    expect(getFilter()).toEqual(withViewFilters('2026-03-08', '2026-03-09'));
  });
});
