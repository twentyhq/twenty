import { computeStartEndDate } from '@/analytics/utils/computeStartEndDate';
import { subDays, subHours } from 'date-fns';

describe('computeStartEndDate', () => {
  it('should return the correct start and end dates for 7 days', () => {
    const { start, end } = computeStartEndDate('7D');
    const expectedStart = subDays(new Date(), 7).toISOString();
    const expectedEnd = new Date().toISOString();
    expect(start).toEqual(expectedStart);
    expect(end).toEqual(expectedEnd);
  });

  it('should return the correct start and end dates for 1 day', () => {
    const { start, end } = computeStartEndDate('1D');
    const expectedStart = subDays(new Date(), 1).toISOString();
    const expectedEnd = new Date().toISOString();
    expect(start).toEqual(expectedStart);
    expect(end).toEqual(expectedEnd);
  });

  it('should return the correct start and end dates for 12 hours', () => {
    const { start, end } = computeStartEndDate('12H');
    const expectedStart = subHours(new Date(), 12).toISOString();
    const expectedEnd = new Date().toISOString();
    expect(start).toEqual(expectedStart);
    expect(end).toEqual(expectedEnd);
  });

  it('should return the correct start and end dates for 4 hours', () => {
    const { start, end } = computeStartEndDate('4H');
    const expectedStart = subHours(new Date(), 4).toISOString();
    const expectedEnd = new Date().toISOString();
    expect(start).toEqual(expectedStart);
    expect(end).toEqual(expectedEnd);
  });
});
