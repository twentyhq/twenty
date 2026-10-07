import { isDashboardFilterSlotCrossFiltered } from '@/page-layout/dashboard-filters/utils/isDashboardFilterSlotCrossFiltered';
import { removeCrossFilteredDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/removeCrossFilteredDashboardFilterValues';
import {
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';

const NEW_STAGE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(['NEW']),
};

const CUSTOMER_STAGE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(['CUSTOMER']),
};

const THIS_MONTH_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_RELATIVE,
  value: '{"direction":"THIS","amount":1,"unit":"MONTH"}',
};

describe('isDashboardFilterSlotCrossFiltered', () => {
  it('is true only while the slot still holds the value the chart set', () => {
    expect(
      isDashboardFilterSlotCrossFiltered({
        slotId: 'stage',
        dashboardFilterValues: { stage: NEW_STAGE_VALUE },
        dashboardFilterCrossFilterValues: { stage: { ...NEW_STAGE_VALUE } },
      }),
    ).toBe(true);

    expect(
      isDashboardFilterSlotCrossFiltered({
        slotId: 'stage',
        dashboardFilterValues: { stage: CUSTOMER_STAGE_VALUE },
        dashboardFilterCrossFilterValues: { stage: NEW_STAGE_VALUE },
      }),
    ).toBe(false);

    expect(
      isDashboardFilterSlotCrossFiltered({
        slotId: 'stage',
        dashboardFilterValues: {},
        dashboardFilterCrossFilterValues: { stage: NEW_STAGE_VALUE },
      }),
    ).toBe(false);

    expect(
      isDashboardFilterSlotCrossFiltered({
        slotId: 'stage',
        dashboardFilterValues: { stage: NEW_STAGE_VALUE },
        dashboardFilterCrossFilterValues: {},
      }),
    ).toBe(false);
  });
});

describe('removeCrossFilteredDashboardFilterValues', () => {
  it('removes the values charts set and keeps the ones the viewer picked', () => {
    expect(
      removeCrossFilteredDashboardFilterValues({
        dashboardFilterValues: {
          stage: NEW_STAGE_VALUE,
          date: THIS_MONTH_VALUE,
        },
        dashboardFilterCrossFilterValues: { stage: NEW_STAGE_VALUE },
      }),
    ).toEqual({ date: THIS_MONTH_VALUE });
  });

  it('keeps a value the viewer changed after the chart set it', () => {
    const dashboardFilterValues = { stage: CUSTOMER_STAGE_VALUE };

    expect(
      removeCrossFilteredDashboardFilterValues({
        dashboardFilterValues,
        dashboardFilterCrossFilterValues: { stage: NEW_STAGE_VALUE },
      }),
    ).toBe(dashboardFilterValues);
  });

  it('returns the same record when nothing is cross-filtered', () => {
    const dashboardFilterValues = { date: THIS_MONTH_VALUE };

    expect(
      removeCrossFilteredDashboardFilterValues({
        dashboardFilterValues,
        dashboardFilterCrossFilterValues: {},
      }),
    ).toBe(dashboardFilterValues);
  });
});
