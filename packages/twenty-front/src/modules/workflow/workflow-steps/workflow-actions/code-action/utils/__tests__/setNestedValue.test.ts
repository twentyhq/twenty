import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';

describe('setNestedValue', () => {
  it('should set nested value properly', () => {
    const obj = { a: { b: 'b' } };
    const path = ['a', 'b'];
    const newValue = 'bb';
    const expectedResult = { a: { b: newValue } };
    expect(setNestedValue(obj, path, newValue)).toEqual(expectedResult);
  });

  it('should not mutate the initial object', () => {
    const expectedObject = { a: { b: 'b' } };

    const initialObject = structuredClone(expectedObject);
    const path = ['a', 'b'];
    const newValue = 'bb';

    const updatedObject = setNestedValue(initialObject, path, newValue);

    expect(initialObject).toEqual(expectedObject);

    expect(updatedObject).not.toBe(initialObject);
    expect(updatedObject.a).not.toBe(initialObject.a);
  });
});
