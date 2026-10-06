import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
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

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

describe('resolveInitialDashboardFilterValues', () => {
  it('lets the URL value win over the slot default', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [DATE_SLOT_WITH_DEFAULT],
        valuesFromUrl: { date: PAST_VALUE },
      }),
    ).toEqual({ date: PAST_VALUE });
  });

  it('uses the default when the URL is silent on the slot', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [DATE_SLOT_WITH_DEFAULT],
        valuesFromUrl: {},
      }),
    ).toEqual({ date: TODAY_VALUE });
  });

  it('ignores a default that is not valid for the slot', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [
          {
            ...DATE_SLOT_WITH_DEFAULT,
            defaultValue: { operand: ViewFilterOperand.IS_AFTER, value: '' },
          },
        ],
        valuesFromUrl: {},
      }),
    ).toEqual({});
  });

  it('leaves a slot without default undefined', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [DATE_SLOT_WITH_DEFAULT, OWNER_SLOT],
        valuesFromUrl: {},
      }),
    ).toEqual({ date: TODAY_VALUE });
  });
});
