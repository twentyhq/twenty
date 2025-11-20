import { calculateQuarterDateRange } from '@/page-layout/widgets/graph/utils/calculateQuarterDateRange';

describe('calculateQuarterDateRange', () => {
  describe('Q1 (January - March)', () => {
    it('should calculate Q1 range for January', () => {
      const result = calculateQuarterDateRange(new Date('2024-01-15'));

      expect(result.rangeStartDate.getFullYear()).toBe(2024);
      expect(result.rangeStartDate.getMonth()).toBe(0);
      expect(result.rangeStartDate.getDate()).toBe(1);

      expect(result.rangeEndDate.getFullYear()).toBe(2024);
      expect(result.rangeEndDate.getMonth()).toBe(2);
      expect(result.rangeEndDate.getDate()).toBe(31);
    });

    it('should calculate Q1 range for February', () => {
      const result = calculateQuarterDateRange(new Date('2024-02-15'));

      expect(result.rangeStartDate.getMonth()).toBe(0);
      expect(result.rangeEndDate.getMonth()).toBe(2);
    });

    it('should calculate Q1 range for March', () => {
      const result = calculateQuarterDateRange(new Date('2024-03-15'));

      expect(result.rangeStartDate.getMonth()).toBe(0);
      expect(result.rangeEndDate.getMonth()).toBe(2);
    });
  });

  describe('Q2 (April - June)', () => {
    it('should calculate Q2 range for April', () => {
      const result = calculateQuarterDateRange(new Date('2024-04-15'));

      expect(result.rangeStartDate.getMonth()).toBe(3);
      expect(result.rangeStartDate.getDate()).toBe(1);

      expect(result.rangeEndDate.getMonth()).toBe(5);
      expect(result.rangeEndDate.getDate()).toBe(30);
    });

    it('should calculate Q2 range for May', () => {
      const result = calculateQuarterDateRange(new Date('2024-05-15'));

      expect(result.rangeStartDate.getMonth()).toBe(3);
      expect(result.rangeEndDate.getMonth()).toBe(5);
    });

    it('should calculate Q2 range for June', () => {
      const result = calculateQuarterDateRange(new Date('2024-06-15'));

      expect(result.rangeStartDate.getMonth()).toBe(3);
      expect(result.rangeEndDate.getMonth()).toBe(5);
    });
  });

  describe('Q3 (July - September)', () => {
    it('should calculate Q3 range for July', () => {
      const result = calculateQuarterDateRange(new Date('2024-07-15'));

      expect(result.rangeStartDate.getMonth()).toBe(6);
      expect(result.rangeStartDate.getDate()).toBe(1);

      expect(result.rangeEndDate.getMonth()).toBe(8);
      expect(result.rangeEndDate.getDate()).toBe(30);
    });

    it('should calculate Q3 range for August', () => {
      const result = calculateQuarterDateRange(new Date('2024-08-15'));

      expect(result.rangeStartDate.getMonth()).toBe(6);
      expect(result.rangeEndDate.getMonth()).toBe(8);
    });

    it('should calculate Q3 range for September', () => {
      const result = calculateQuarterDateRange(new Date('2024-09-15'));

      expect(result.rangeStartDate.getMonth()).toBe(6);
      expect(result.rangeEndDate.getMonth()).toBe(8);
    });
  });

  describe('Q4 (October - December)', () => {
    it('should calculate Q4 range for October', () => {
      const result = calculateQuarterDateRange(new Date('2024-10-15'));

      expect(result.rangeStartDate.getMonth()).toBe(9);
      expect(result.rangeStartDate.getDate()).toBe(1);

      expect(result.rangeEndDate.getMonth()).toBe(11);
      expect(result.rangeEndDate.getDate()).toBe(31);
    });

    it('should calculate Q4 range for November', () => {
      const result = calculateQuarterDateRange(new Date('2024-11-15'));

      expect(result.rangeStartDate.getMonth()).toBe(9);
      expect(result.rangeEndDate.getMonth()).toBe(11);
    });

    it('should calculate Q4 range for December', () => {
      const result = calculateQuarterDateRange(new Date('2024-12-15'));

      expect(result.rangeStartDate.getMonth()).toBe(9);
      expect(result.rangeEndDate.getMonth()).toBe(11);
    });
  });

  describe('Timezone handling', () => {
    it('should apply timezone when provided', () => {
      const timezone = 'America/New_York';
      const result = calculateQuarterDateRange(
        new Date('2024-03-15T10:00:00Z'),
        timezone,
      );

      expect(result.rangeStartDate).toBeDefined();
      expect(result.rangeEndDate).toBeDefined();
      expect(result.rangeStartDate.getMonth()).toBe(0);
    });

    it('should work without timezone', () => {
      const result = calculateQuarterDateRange(new Date('2024-06-15'));

      expect(result.rangeStartDate).toBeDefined();
      expect(result.rangeEndDate).toBeDefined();
      expect(result.rangeStartDate.getMonth()).toBe(3);
    });
  });

  describe('End of quarter includes end of day', () => {
    it('should include end of last day for Q1', () => {
      const result = calculateQuarterDateRange(new Date('2024-01-15'));

      expect(result.rangeEndDate.getDate()).toBe(31);
      expect(result.rangeEndDate.getHours()).toBe(23);
      expect(result.rangeEndDate.getMinutes()).toBe(59);
      expect(result.rangeEndDate.getSeconds()).toBe(59);
    });

    it('should include end of last day for Q2', () => {
      const result = calculateQuarterDateRange(new Date('2024-04-15'));

      expect(result.rangeEndDate.getDate()).toBe(30);
      expect(result.rangeEndDate.getHours()).toBe(23);
    });

    it('should include end of last day for Q4', () => {
      const result = calculateQuarterDateRange(new Date('2024-10-15'));

      expect(result.rangeEndDate.getDate()).toBe(31);
      expect(result.rangeEndDate.getHours()).toBe(23);
    });
  });

  describe('Year boundaries', () => {
    it('should correctly handle quarter at year start', () => {
      const result = calculateQuarterDateRange(new Date('2024-01-01'));

      expect(result.rangeStartDate.getFullYear()).toBe(2024);
      expect(result.rangeEndDate.getFullYear()).toBe(2024);
      expect(result.rangeStartDate.getMonth()).toBe(0);
    });

    it('should correctly handle quarter at year end', () => {
      const result = calculateQuarterDateRange(new Date('2024-12-31'));

      expect(result.rangeStartDate.getFullYear()).toBe(2024);
      expect(result.rangeEndDate.getFullYear()).toBe(2024);
      expect(result.rangeEndDate.getMonth()).toBe(11);
    });
  });
});
