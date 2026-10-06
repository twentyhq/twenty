import { areDashboardFilterValuesAtDefaults } from '@/page-layout/dashboard-filters/utils/areDashboardFilterValuesAtDefaults';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };
const PAST_VALUE = { operand: ViewFilterOperand.IS_IN_PAST, value: '' };
const RELATIVE_VALUE = {
  operand: ViewFilterOperand.IS_RELATIVE,
  value: 'PAST_7_DAY',
};

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

describe('areDashboardFilterValuesAtDefaults', () => {
  it('is true when no slot has a default and no slot has a value', () => {
    expect(
      areDashboardFilterValuesAtDefaults({ slots: [OWNER_SLOT], values: {} }),
    ).toBe(true);
  });

  it('is true when every value equals its default by operand and value', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [DATE_SLOT_WITH_DEFAULT, OWNER_SLOT],
        values: { date: { ...TODAY_VALUE } },
      }),
    ).toBe(true);
  });

  it('is false when a slot with a default has no value', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [DATE_SLOT_WITH_DEFAULT],
        values: {},
      }),
    ).toBe(false);
  });

  it('is false when a slot without default has a value', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [OWNER_SLOT],
        values: {
          owner: {
            operand: ViewFilterOperand.IS,
            value: JSON.stringify({
              isCurrentWorkspaceMemberSelected: true,
              selectedRecordIds: [],
            }),
          },
        },
      }),
    ).toBe(false);
  });

  it('is false when the operand differs from the default', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [DATE_SLOT_WITH_DEFAULT],
        values: { date: PAST_VALUE },
      }),
    ).toBe(false);
  });

  it('is false when only the value differs from the default', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [{ ...DATE_SLOT_WITH_DEFAULT, defaultValue: RELATIVE_VALUE }],
        values: { date: { ...RELATIVE_VALUE, value: 'PAST_30_DAY' } },
      }),
    ).toBe(false);
  });

  it('treats an invalid default like no default', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [
          {
            ...DATE_SLOT_WITH_DEFAULT,
            defaultValue: { operand: ViewFilterOperand.CONTAINS, value: 'x' },
          },
        ],
        values: {},
      }),
    ).toBe(true);
  });

  it('ignores a value left for a slot the dashboard no longer has', () => {
    expect(
      areDashboardFilterValuesAtDefaults({
        slots: [DATE_SLOT_WITH_DEFAULT],
        values: { date: TODAY_VALUE, removed: PAST_VALUE },
      }),
    ).toBe(true);
  });
});
