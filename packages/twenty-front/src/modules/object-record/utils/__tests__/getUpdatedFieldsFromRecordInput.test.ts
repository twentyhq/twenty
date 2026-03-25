import { getUpdatedFieldsFromRecordInput } from '@/object-record/utils/getUpdatedFieldsFromRecordInput';

describe('getUpdatedFieldsFromRecordInput', () => {
  it('should return field entries excluding id', () => {
    const input = { id: '123', name: 'Alice', age: 30 };

    const result = getUpdatedFieldsFromRecordInput(input);

    expect(result).toEqual([{ name: 'Alice' }, { age: 30 }]);
  });

  it('should return empty array when only id is present', () => {
    const input = { id: '123' };

    const result = getUpdatedFieldsFromRecordInput(input);

    expect(result).toEqual([]);
  });

  it('should handle inputs without id', () => {
    const input = { name: 'Bob', email: 'bob@test.com' };

    const result = getUpdatedFieldsFromRecordInput(input);

    expect(result).toEqual([{ name: 'Bob' }, { email: 'bob@test.com' }]);
  });

  it('should handle empty input', () => {
    const result = getUpdatedFieldsFromRecordInput({});

    expect(result).toEqual([]);
  });
});
