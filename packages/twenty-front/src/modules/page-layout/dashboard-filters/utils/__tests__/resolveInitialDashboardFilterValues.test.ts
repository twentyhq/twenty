import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';

const SLOT_WITH_DEFAULT: DashboardFilterSlot = {
  id: 'closing-month',
  label: 'Closing month',
  filterType: 'DATE',
  defaultOperand: ViewFilterOperand.IS_RELATIVE,
  defaultValue: 'THIS_1_MONTH',
};

const SLOT_WITHOUT_DEFAULT: DashboardFilterSlot = {
  id: 'company-name',
  label: 'Company name',
  filterType: 'TEXT',
};

// Built-ins carry an operand so the chip opens on it, but no value to filter with.
const BUILT_IN_LIKE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
  defaultOperand: ViewFilterOperand.IS_RELATIVE,
};

const SLOT_WITH_VALUELESS_DEFAULT: DashboardFilterSlot = {
  id: 'due-date',
  label: 'Due date',
  filterType: 'DATE',
  defaultOperand: ViewFilterOperand.IS_TODAY,
  defaultValue: null,
};

const URL_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01',
};

describe('resolveInitialDashboardFilterValues', () => {
  it('takes the URL value when the slot has no default', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITHOUT_DEFAULT],
        urlValues: { [SLOT_WITHOUT_DEFAULT.id]: URL_VALUE },
      }),
    ).toEqual({ [SLOT_WITHOUT_DEFAULT.id]: URL_VALUE });
  });

  it('takes the default when the URL has no value for the slot', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITH_DEFAULT],
        urlValues: {},
      }),
    ).toEqual({
      [SLOT_WITH_DEFAULT.id]: {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_MONTH',
      },
    });
  });

  it('lets the URL value win over the default', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITH_DEFAULT],
        urlValues: { [SLOT_WITH_DEFAULT.id]: URL_VALUE },
      }),
    ).toEqual({ [SLOT_WITH_DEFAULT.id]: URL_VALUE });
  });

  it('leaves the slot out when neither the URL nor the slot provides a value', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITHOUT_DEFAULT, BUILT_IN_LIKE_SLOT],
        urlValues: {},
      }),
    ).toEqual({});
  });

  it('seeds a valueless default operand such as IS_TODAY', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITH_VALUELESS_DEFAULT],
        urlValues: {},
      }),
    ).toEqual({
      [SLOT_WITH_VALUELESS_DEFAULT.id]: {
        operand: ViewFilterOperand.IS_TODAY,
        value: '',
      },
    });
  });

  it('ignores URL values for slots the dashboard no longer has', () => {
    expect(
      resolveInitialDashboardFilterValues({
        slots: [SLOT_WITH_DEFAULT],
        urlValues: { 'removed-slot': URL_VALUE },
      }),
    ).toEqual({
      [SLOT_WITH_DEFAULT.id]: {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_MONTH',
      },
    });
  });
});
