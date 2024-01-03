import { ActivityForDrawer } from '@/activities/types/ActivityForDrawer';
import { mockedActivities } from '~/testing/mock-data/activities';

import { groupActivitiesByMonth } from '../groupActivitiesByMonth';

describe('groupActivitiesByMonth', () => {
  it('should group activities by month', () => {
    const grouped = groupActivitiesByMonth(
      mockedActivities as unknown as ActivityForDrawer[],
    );

    expect(grouped).toHaveLength(2);
    expect(grouped[0].items).toHaveLength(1);
    expect(grouped[1].items).toHaveLength(1);

    expect(grouped[0].year).toBe(new Date().getFullYear());
    expect(grouped[1].year).toBe(2023);

    expect(grouped[0].month).toBe(new Date().getMonth());
    expect(grouped[1].month).toBe(3);
  });
});
