import { mockedEvents } from '~/testing/mock-data/events';

import { groupEventsByMonth } from '../groupEventsByMonth';

describe('groupEventsByMonth', () => {
  it('should group activities by month', () => {
    const grouped = groupEventsByMonth(mockedEvents as unknown as Event[]);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].items).toHaveLength(1);
    expect(grouped[1].items).toHaveLength(1);

    expect(grouped[0].year).toBe(new Date().getFullYear());
    expect(grouped[1].year).toBe(2023);

    expect(grouped[0].month).toBe(new Date().getMonth());
    expect(grouped[1].month).toBe(3);
  });
});
