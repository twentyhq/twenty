import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

describe('computeOptionValueFromLabel', () => {
  it('should handle labels starting with numbers by adding OPT prefix', () => {
    expect(computeOptionValueFromLabel('123Test')).toBe('OPT123TEST');
    expect(computeOptionValueFromLabel('0Label')).toBe('OPT0LABEL');
    expect(computeOptionValueFromLabel('9Something')).toBe('OPT9SOMETHING');
  });

  it('should handle labels not starting with numbers without adding prefix', () => {
    expect(computeOptionValueFromLabel('TestLabel')).toBe('TESTLABEL');
    expect(computeOptionValueFromLabel('aLabel')).toBe('ALABEL');
    expect(computeOptionValueFromLabel('_Label')).toBe('LABEL');
  });

  it('should convert to uppercase', () => {
    expect(computeOptionValueFromLabel('testlabel')).toBe('TESTLABEL');
    expect(computeOptionValueFromLabel('TestLabel')).toBe('TESTLABEL');
    expect(computeOptionValueFromLabel('TESTLABEL')).toBe('TESTLABEL');
  });

  it('should replace spaces and special characters with underscores', () => {
    expect(computeOptionValueFromLabel('Test Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test-Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test.Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test@Label')).toBe('TEST_LABEL');
  });

  it('should handle multiple consecutive special characters', () => {
    expect(computeOptionValueFromLabel('Test   Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test---Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test...Label')).toBe('TEST_LABEL');
  });

  it('should trim whitespace from beginning and end', () => {
    expect(computeOptionValueFromLabel('  TestLabel  ')).toBe('TESTLABEL');
    expect(computeOptionValueFromLabel('  Test Label  ')).toBe('TEST_LABEL');
  });

  it('should handle non-latin characters', () => {
    expect(computeOptionValueFromLabel('TestéLabel')).toBe('TESTELABEL');
    expect(computeOptionValueFromLabel('TestñLabel')).toBe('TESTNLABEL');
    expect(computeOptionValueFromLabel('TestüLabel')).toBe('TESTULABEL');
  });

  it('should handle empty string', () => {
    expect(computeOptionValueFromLabel('')).toBe('');
  });

  it('should handle string with only numbers', () => {
    expect(computeOptionValueFromLabel('123')).toBe('OPT123');
    expect(computeOptionValueFromLabel('0')).toBe('OPT0');
  });

  it('should handle string with only special characters', () => {
    expect(computeOptionValueFromLabel('!@#$%')).toBe('');
    expect(computeOptionValueFromLabel('   ')).toBe('');
  });

  it('should preserve underscores in the middle of the string', () => {
    expect(computeOptionValueFromLabel('Test_Label')).toBe('TEST_LABEL');
    expect(computeOptionValueFromLabel('Test__Label')).toBe('TEST__LABEL');
  });

  it('should remove leading underscores', () => {
    expect(computeOptionValueFromLabel('_TestLabel')).toBe('TESTLABEL');
    expect(computeOptionValueFromLabel('__TestLabel')).toBe('TESTLABEL');
  });

  it('should handle mixed case scenarios', () => {
    expect(computeOptionValueFromLabel('1Test Label')).toBe('OPT1TEST_LABEL');
    expect(computeOptionValueFromLabel('Test 1 Label')).toBe('TEST_1_LABEL');
    expect(computeOptionValueFromLabel('Test Label 1')).toBe('TEST_LABEL_1');
  });
});
