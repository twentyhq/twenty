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

  // The server mints its own cursors with Buffer.toString('base64url'), so the
  // bytes are pinned rather than only the shape of the alphabet: for this
  // payload the two alphabets coincide and only the padding differs
  it('should emit the same bytes the server would for the same payload', () => {
    const record: ObjectRecord = {
      __typename: 'ObjectRecord',
      id: '81285b87-91e3-48ea-82ee-256b379f83d9',
      position: 0,
    };

    expect(encodeCursor(record)).toBe(
      Buffer.from(
        JSON.stringify({ position: record.position, id: record.id }),
        'utf-8',
      ).toString('base64url'),
    );
    expect(encodeCursor(record)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  // Jest resolves 'buffer' to Node's builtin, which implements 'base64url';
  // the browser build gets the polyfill, which throws on it. Without this the
  // suite would stay green while every optimistic cache write broke in the app
  it('should only use encodings the browser Buffer polyfill implements', async () => {
    jest.resetModules();
    jest.doMock('buffer', () => jest.requireActual('buffer/'));

    const { encodeCursor: encodeCursorWithPolyfill } =
      await import('@/apollo/utils/encodeCursor');
    const record: ObjectRecord = {
      __typename: 'ObjectRecord',
      id: '123',
      position: 1,
    };

    expect(encodeCursorWithPolyfill(record)).toBe(encodeCursor(record));

    jest.dontMock('buffer');
    jest.resetModules();
  });

  it('should throw an error if record does not have an id', () => {
    const record = { position: 1 } as any;

    expect(() => encodeCursor(record)).toThrow();
  });
});
