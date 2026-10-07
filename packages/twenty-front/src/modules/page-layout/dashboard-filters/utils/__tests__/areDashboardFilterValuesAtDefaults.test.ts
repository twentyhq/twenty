import { areDashboardFilterValuesAtDefaults } from '@/page-layout/dashboard-filters/utils/areDashboardFilterValuesAtDefaults';
import {
  type DashboardFilterSlot,
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
  defaultOperand: ViewFilterOperand.CONTAINS,
};

const DEFAULT_VALUE = {
  operand: ViewFilterOperand.IS_RELATIVE,
  value: 'THIS_1_MONTH',
};

describe('areDashboardFilterValuesAtDefaults', () => {
  it('is true when every slot holds its default and defaultless slots are unset', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [SLOT_WITH_DEFAULT, SLOT_WITHOUT_DEFAULT],
        values: { [SLOT_WITH_DEFAULT.id]: DEFAULT_VALUE },
      }),
    ).toBe(true);
  });

  it('is false when a slot value differs from its default', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [SLOT_WITH_DEFAULT],
        values: {
          [SLOT_WITH_DEFAULT.id]: {
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'LAST_1_MONTH',
          },
        },
      }),
    ).toBe(false);
  });

  it('is false when a slot with a default is unset', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [SLOT_WITH_DEFAULT],
        values: {},
      }),
    ).toBe(false);
  });

  it('is false when a slot without a default is set', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [SLOT_WITHOUT_DEFAULT],
        values: {
          [SLOT_WITHOUT_DEFAULT.id]: {
            operand: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        },
      }),
    ).toBe(false);
  });

  it('treats a value that would not filter as unset', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [SLOT_WITHOUT_DEFAULT],
        values: {
          [SLOT_WITHOUT_DEFAULT.id]: {
            operand: ViewFilterOperand.CONTAINS,
            value: '',
          },
        },
      }),
    ).toBe(true);
  });
});
