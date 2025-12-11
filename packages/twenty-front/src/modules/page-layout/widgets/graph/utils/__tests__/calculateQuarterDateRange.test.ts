import { calculateQuarterDateRange } from '../calculateQuarterDateRange';

describe('calculateQuarterDateRange', () => {
  describe('Q1 (January - March)', () => {
    it('should return Q1 range for January date', () => {
      const date = new Date('2024-01-15');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getFullYear()).toBe(2024);
      expect(result.rangeStartDate.getMonth()).toBe(0);
      expect(result.rangeStartDate.getDate()).toBe(1);

      expect(result.rangeEndDate.getFullYear()).toBe(2024);
      expect(result.rangeEndDate.getMonth()).toBe(2);
      expect(result.rangeEndDate.getDate()).toBe(31);
    });

    it('should return Q1 range for March date', () => {
      const date = new Date('2024-03-20');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getMonth()).toBe(0);
      expect(result.rangeEndDate.getMonth()).toBe(2);
    });
  });

  describe('Q2 (April - June)', () => {
    it('should return Q2 range for April date', () => {
      const date = new Date('2024-04-15');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getMonth()).toBe(3);
      expect(result.rangeStartDate.getDate()).toBe(1);
      expect(result.rangeEndDate.getMonth()).toBe(5);
      expect(result.rangeEndDate.getDate()).toBe(30);
    });
  });

  describe('Q3 (July - September)', () => {
    it('should return Q3 range for August date', () => {
      const date = new Date('2024-08-15');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getMonth()).toBe(6);
      expect(result.rangeStartDate.getDate()).toBe(1);
      expect(result.rangeEndDate.getMonth()).toBe(8);
      expect(result.rangeEndDate.getDate()).toBe(30);
    });
  });

  describe('Q4 (October - December)', () => {
    it('should return Q4 range for November date', () => {
      const date = new Date('2024-11-15');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getMonth()).toBe(9);
      expect(result.rangeStartDate.getDate()).toBe(1);
      expect(result.rangeEndDate.getMonth()).toBe(11);
      expect(result.rangeEndDate.getDate()).toBe(31);
    });
  });

  describe('year boundary', () => {
    it('should handle year correctly for Q1', () => {
      const date = new Date('2025-02-15');
      const result = calculateQuarterDateRange(date);

      expect(result.rangeStartDate.getFullYear()).toBe(2025);
      expect(result.rangeEndDate.getFullYear()).toBe(2025);
    });
  });
});
