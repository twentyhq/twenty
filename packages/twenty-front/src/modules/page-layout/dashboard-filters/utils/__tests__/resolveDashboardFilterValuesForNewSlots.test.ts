import { resolveDashboardFilterValuesForNewSlots } from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterValuesForNewSlots';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };
const PAST_VALUE = { operand: ViewFilterOperand.IS_IN_PAST, value: '' };

const DATE_SLOT_WITH_DEFAULT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
  defaultValue: TODAY_VALUE,
};

const PERIOD_SLOT_WITH_DEFAULT: DashboardFilterSlot = {
  id: 'period',
  label: 'Period',
  filterType: 'DATE_TIME',
  defaultValue: PAST_VALUE,
};

describe('resolveDashboardFilterValuesForNewSlots', () => {
  it('seeds the default of a slot not seen yet when it has no value', () => {
    expect(
      resolveDashboardFilterValuesForNewSlots({
        slots: [DATE_SLOT_WITH_DEFAULT, PERIOD_SLOT_WITH_DEFAULT],
        seenSlotIds: new Set(['date']),
        values: {},
      }),
    ).toEqual({ period: PAST_VALUE });
  });

  it('keeps the value a new slot already has', () => {
    expect(
      resolveDashboardFilterValuesForNewSlots({
        slots: [PERIOD_SLOT_WITH_DEFAULT],
        seenSlotIds: new Set(),
        values: { period: TODAY_VALUE },
      }),
    ).toEqual({ period: TODAY_VALUE });
  });

  it('never re-seeds a slot already seen, even when it was cleared', () => {
    expect(
      resolveDashboardFilterValuesForNewSlots({
        slots: [DATE_SLOT_WITH_DEFAULT],
        seenSlotIds: new Set(['date']),
        values: {},
      }),
    ).toEqual({});
  });

  it('ignores an invalid default on a new slot', () => {
    expect(
      resolveDashboardFilterValuesForNewSlots({
        slots: [
          {
            ...PERIOD_SLOT_WITH_DEFAULT,
            defaultValue: { operand: ViewFilterOperand.CONTAINS, value: 'x' },
          },
        ],
        seenSlotIds: new Set(),
        values: {},
      }),
    ).toEqual({});
  });

  it('returns the same values object when nothing is seeded', () => {
    const values = { date: TODAY_VALUE };

    expect(
      resolveDashboardFilterValuesForNewSlots({
        slots: [DATE_SLOT_WITH_DEFAULT],
        seenSlotIds: new Set(['date']),
        values,
      }),
    ).toBe(values);
  });
});
