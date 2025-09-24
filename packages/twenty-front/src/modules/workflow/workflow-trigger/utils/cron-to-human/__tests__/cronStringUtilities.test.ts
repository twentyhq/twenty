import {
  formatCronTime,
  getOrdinalNumber,
  isListValue,
  isNumericRange,
  isStepValue,
} from '@/workflow/workflow-trigger/utils/cron-to-human/utils/cronStringUtilities';

describe('cronStringUtilities', () => {
  describe('formatCronTime', () => {
    it('should format 24-hour time', () => {
      expect(formatCronTime('9', '30', true)).toBe('09:30');
      expect(formatCronTime('14', '0', true)).toBe('14:00');
      expect(formatCronTime('0', '0', true)).toBe('00:00');
      expect(formatCronTime('23', '59', true)).toBe('23:59');
    });

    it('should format 12-hour time', () => {
      expect(formatCronTime('9', '30', false)).toBe('9:30 AM');
      expect(formatCronTime('14', '0', false)).toBe('2:00 PM');
      expect(formatCronTime('0', '0', false)).toBe('12:00 AM');
      expect(formatCronTime('12', '0', false)).toBe('12:00 PM');
      expect(formatCronTime('23', '59', false)).toBe('11:59 PM');
    });

    it('should handle invalid inputs', () => {
      expect(formatCronTime('invalid', '30', true)).toBe('');
      expect(formatCronTime('9', 'invalid', true)).toBe('');
      expect(formatCronTime('', '', true)).toBe('');
    });
  });

  describe('getOrdinalNumber', () => {
    it('should return correct ordinal numbers', () => {
      expect(getOrdinalNumber(1)).toBe('1st');
      expect(getOrdinalNumber(2)).toBe('2nd');
      expect(getOrdinalNumber(3)).toBe('3rd');
      expect(getOrdinalNumber(4)).toBe('4th');
      expect(getOrdinalNumber(11)).toBe('11th');
      expect(getOrdinalNumber(21)).toBe('21st');
      expect(getOrdinalNumber(22)).toBe('22nd');
      expect(getOrdinalNumber(23)).toBe('23rd');
    });
  });

  describe('pattern detection', () => {
    describe('isNumericRange', () => {
      it('should detect numeric ranges', () => {
        expect(isNumericRange('1-5')).toBe(true);
        expect(isNumericRange('10-20')).toBe(true);
        expect(isNumericRange('0-59')).toBe(true);
      });

      it('should detect single numbers', () => {
        expect(isNumericRange('15')).toBe(true);
        expect(isNumericRange('0')).toBe(true);
      });

      it('should reject non-numeric ranges', () => {
        expect(isNumericRange('*')).toBe(false);
        expect(isNumericRange('*/5')).toBe(false);
        expect(isNumericRange('1,2,3')).toBe(false);
        expect(isNumericRange('invalid')).toBe(false);
      });
    });

    describe('isStepValue', () => {
      it('should detect step values', () => {
        expect(isStepValue('*/5')).toBe(true);
        expect(isStepValue('1-10/2')).toBe(true);
        expect(isStepValue('0-59/15')).toBe(true);
      });

      it('should reject non-step values', () => {
        expect(isStepValue('*')).toBe(false);
        expect(isStepValue('1-5')).toBe(false);
        expect(isStepValue('1,2,3')).toBe(false);
        expect(isStepValue('15')).toBe(false);
      });
    });

    describe('isListValue', () => {
      it('should detect list values', () => {
        expect(isListValue('1,2,3')).toBe(true);
        expect(isListValue('0,15,30,45')).toBe(true);
        expect(isListValue('1,5')).toBe(true);
      });

      it('should reject non-list values', () => {
        expect(isListValue('*')).toBe(false);
        expect(isListValue('*/5')).toBe(false);
        expect(isListValue('1-5')).toBe(false);
        expect(isListValue('15')).toBe(false);
      });
    });
  });
});
