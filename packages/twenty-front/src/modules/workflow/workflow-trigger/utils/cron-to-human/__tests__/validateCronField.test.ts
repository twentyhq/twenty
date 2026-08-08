import { validateCronField } from '@/workflow/workflow-trigger/utils/cron-to-human/utils/validateCronField';

describe('validateCronField', () => {
  it('should accept wildcards, values, ranges and steps', () => {
    expect(validateCronField('*', 'hours')).toBe(true);
    expect(validateCronField('9', 'hours')).toBe(true);
    expect(validateCronField('1-5', 'hours')).toBe(true);
    expect(validateCronField('*/5', 'hours')).toBe(true);
    expect(validateCronField('1,2,3', 'minutes')).toBe(true);
  });

  it('should reject values outside the field range', () => {
    expect(validateCronField('99', 'hours')).toBe(false);
    expect(validateCronField('60', 'minutes')).toBe(false);
    expect(validateCronField('1-99', 'hours')).toBe(false);
  });

  it('should validate every item of a comma-separated list, not just the first', () => {
    // Regression: '-'/'/' used to be handled before ',', so only the first list
    // item was checked and out-of-range items after it were silently accepted.
    expect(validateCronField('1-5,10', 'hours')).toBe(true);
    expect(validateCronField('1-5,99', 'hours')).toBe(false);
    expect(validateCronField('0-23,88,77', 'hours')).toBe(false);
    expect(validateCronField('*/5,999', 'hours')).toBe(false);
  });

  it('should treat 0 and 7 as valid days of week', () => {
    expect(validateCronField('0-7,7', 'dayOfWeek')).toBe(true);
    expect(validateCronField('8', 'dayOfWeek')).toBe(false);
  });
});
