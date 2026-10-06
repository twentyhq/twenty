import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const TODAY_VALUE = { operand: ViewFilterOperand.IS_TODAY, value: '' };

describe('getDashboardFilterDefaultValues', () => {
  it('keeps a valid default and skips slots without one', () => {
    const slots: DashboardFilterSlot[] = [
      {
        id: 'date',
        label: 'Date',
        filterType: 'DATE_TIME',
        defaultValue: TODAY_VALUE,
      },
      { id: 'owner', label: 'Owner', filterType: 'RELATION' },
      { id: 'stage', label: 'Stage', filterType: 'SELECT', defaultValue: null },
    ];

    expect(getDashboardFilterDefaultValues({ slots })).toEqual({
      date: TODAY_VALUE,
    });
  });

  it('ignores a default that is not valid for its slot type', () => {
    const slots: DashboardFilterSlot[] = [
      {
        id: 'date',
        label: 'Date',
        filterType: 'DATE_TIME',
        defaultValue: { operand: ViewFilterOperand.CONTAINS, value: 'x' },
      },
    ];

    expect(getDashboardFilterDefaultValues({ slots })).toEqual({});
  });
});
