import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Buffer } from 'buffer';

describe('encodeCursor', () => {
  it('should create a cursor with id only', () => {
    const record: ObjectRecord = { __typename: 'ObjectRecord', id: '123' };
    const cursor = encodeCursor(record);
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({ id: '123' });
  });

  it('should create a cursor with id and position', () => {
    const record: ObjectRecord = {
      __typename: 'ObjectRecord',
      id: '123',
      position: 1,
    };
    const cursor = encodeCursor(record);
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({ id: '123', position: 1 });
  });

  it('should create a cursor with id and position as 0', () => {
    const record: ObjectRecord = {
      __typename: 'ObjectRecord',
      id: '123',
      position: 0,
    };
    const cursor = encodeCursor(record);
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({ id: '123', position: 0 });
  });

  it('should create a cursor with id and ignore extra fields', () => {
    const record: ObjectRecord = {
      __typename: 'ObjectRecord',
      id: '123',
      position: 1,
      extra: 'extra',
    };
    const cursor = encodeCursor(record);
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({ id: '123', position: 1 });
  });

  it('should throw an error if record does not have an id', () => {
    const record = { position: 1 } as any;

    expect(() => encodeCursor(record)).toThrow();
  });
});
