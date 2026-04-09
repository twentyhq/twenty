import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';

import { doesRecordBelongToGroup } from '@/apollo/optimistic-effect/group-by/utils/doesRecordBelongToGroup';

describe('doesRecordBelongToGroup', () => {
  it('should return true when groupByConfig is undefined', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
      name: 'John',
    };

    const result = doesRecordBelongToGroup(record, ['value1'], undefined);

    expect(result).toBe(true);
  });

  it('should return true when groupByConfig is empty', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
      name: 'John',
    };

    const result = doesRecordBelongToGroup(record, ['value1'], []);

    expect(result).toBe(true);
  });

  it('should return true when record matches group dimension values', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
      name: 'John',
    };

    const result = doesRecordBelongToGroup(record, ['John'], [{ name: true }]);

    expect(result).toBe(true);
  });

  it('should return false when record does not match group dimension values', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
      name: 'John',
    };

    const result = doesRecordBelongToGroup(record, ['Jane'], [{ name: true }]);

    expect(result).toBe(false);
  });

  it('should return false when record field is undefined', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
    };

    const result = doesRecordBelongToGroup(record, ['John'], [{ name: true }]);

    expect(result).toBe(false);
  });
});
