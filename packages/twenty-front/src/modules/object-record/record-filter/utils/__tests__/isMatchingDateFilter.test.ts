import { isMatchingDateFilter } from '@/object-record/record-filter/utils/isMatchingDateFilter';

describe('isMatchingDateFilter', () => {
  const testDate = '2023-12-19T12:15:29.810Z';

  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingDateFilter({ dateFilter: { eq: testDate }, value: testDate }),
      ).toBe(true);
    });

    it('value does not equal eq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { eq: testDate },
          value: '2023-12-18T12:15:29.810Z',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { neq: testDate },
          value: '2023-12-18T12:15:29.810Z',
        }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { neq: testDate },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { in: [testDate, '2023-12-20T12:15:29.810Z'] },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: {
            in: ['2023-12-20T12:15:29.810Z', '2023-12-21T12:15:29.810Z'],
          },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL' },
          value: testDate,
        }),
      ).toBe(true);
    });
  });

  describe('gt', () => {
    it('value is greater than gt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gt: '2023-12-18T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not greater than gt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gt: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('gte', () => {
    it('value is greater than or equal to gte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: testDate },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not greater than or equal to gte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('lt', () => {
    it('value is less than lt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lt: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not less than lt filter', () => {
      expect(
        isMatchingDateFilter({ dateFilter: { lt: testDate }, value: testDate }),
      ).toBe(false);
    });
  });

  describe('lte', () => {
    it('value is less than or equal to lte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lte: testDate },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not less than or equal to lte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lte: '2023-12-18T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });
});
