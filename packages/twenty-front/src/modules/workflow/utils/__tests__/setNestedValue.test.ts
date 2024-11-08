import { setNestedValue } from '@/workflow/utils/setNestedValue';

describe('setNestedValue', () => {
  it('should set nested value properly', () => {
    const obj = { a: { b: 'b' } };
    const path = ['a', 'b'];
    const newValue = 'bb';
    const expectedResult = { a: { b: newValue } };
    expect(setNestedValue(obj, path, newValue)).toEqual(expectedResult);
  });
});
