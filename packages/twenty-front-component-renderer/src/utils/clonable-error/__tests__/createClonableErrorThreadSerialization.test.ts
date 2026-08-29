import { Thread } from '@quilted/threads';
import { CustomError } from 'twenty-shared/utils';

import { FRONT_COMPONENT_THREAD_ERROR_MARKER } from '@/constants/FrontComponentThreadErrorMarker';

import { createClonableErrorThreadSerialization } from '../createClonableErrorThreadSerialization';

class FakeGeckoException {
  name = 'NS_ERROR_FAILURE';
  message = '';
  stack = '@blob:null/uuid:5:15';

  toString(): string {
    return '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]';
  }
}

type TestThreadExports = {
  explode(): Promise<void>;
};

type ThreadMessageListener = (data: unknown) => void;

const createDetachedThread = () =>
  new Thread({ send: () => undefined, listen: () => undefined });

const createExplodingThreadPair = () => {
  const listeners: {
    caller?: ThreadMessageListener;
    responder?: ThreadMessageListener;
  } = {};

  const callingThread = new Thread<TestThreadExports>(
    {
      send: (message) =>
        queueMicrotask(() => listeners.responder?.(structuredClone(message))),
      listen: (listener) => {
        listeners.caller = listener;
      },
    },
    { serialization: createClonableErrorThreadSerialization() },
  );

  new Thread<Record<string, never>, TestThreadExports>(
    {
      send: (message) =>
        queueMicrotask(() => listeners.caller?.(structuredClone(message))),
      listen: (listener) => {
        listeners.responder = listener;
      },
    },
    {
      exports: {
        explode: async () => {
          throw new FakeGeckoException();
        },
      },
      serialization: createClonableErrorThreadSerialization(),
    },
  );

  return callingThread;
};

describe('createClonableErrorThreadSerialization', () => {
  it('should serialize an Error to a marked structured-cloneable payload', () => {
    const serialization = createClonableErrorThreadSerialization();

    const serialized = serialization.serialize(
      new Error('boom'),
      createDetachedThread(),
    );

    expect(serialized).toMatchObject({
      [FRONT_COMPONENT_THREAD_ERROR_MARKER]: {
        name: 'Error',
        message: 'boom',
      },
    });
    expect(() => structuredClone(serialized)).not.toThrow();
  });

  it('should serialize a foreign exception object to its stringified diagnostic', () => {
    const serialization = createClonableErrorThreadSerialization();

    const serialized = serialization.serialize(
      new FakeGeckoException(),
      createDetachedThread(),
    );

    expect(serialized).toEqual({
      [FRONT_COMPONENT_THREAD_ERROR_MARKER]: {
        name: 'NS_ERROR_FAILURE',
        message:
          '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]',
        stack: '@blob:null/uuid:5:15',
        code: undefined,
      },
    });
    expect(() => structuredClone(serialized)).not.toThrow();
  });

  it('should serialize errors nested inside regular payloads', () => {
    const serialization = createClonableErrorThreadSerialization();

    const serialized = serialization.serialize(
      { results: [new Error('nested boom')] },
      createDetachedThread(),
    );

    expect(serialized).toMatchObject({
      results: [
        {
          [FRONT_COMPONENT_THREAD_ERROR_MARKER]: { message: 'nested boom' },
        },
      ],
    });
  });

  it('should leave regular payloads untouched', () => {
    const serialization = createClonableErrorThreadSerialization();

    const payload = {
      url: 'https://example.com',
      headers: { authorization: 'Bearer token' },
    };

    expect(serialization.serialize(payload, createDetachedThread())).toEqual(
      payload,
    );
  });

  it('should deserialize a marked payload into an Error', () => {
    const serialization = createClonableErrorThreadSerialization();

    const deserialized = serialization.deserialize(
      {
        [FRONT_COMPONENT_THREAD_ERROR_MARKER]: {
          name: 'NS_ERROR_FAILURE',
          message: '[Exception...]',
          stack: '@blob:null/uuid:5:15',
        },
      },
      createDetachedThread(),
    );

    expect(deserialized).toBeInstanceOf(Error);
    expect(deserialized).toMatchObject({
      name: 'NS_ERROR_FAILURE',
      message: '[Exception...]',
      stack: '@blob:null/uuid:5:15',
    });
  });

  it('should round-trip a CustomError with its code', () => {
    const serialization = createClonableErrorThreadSerialization();
    const thread = createDetachedThread();

    const roundTripped = serialization.deserialize(
      structuredClone(
        serialization.serialize(
          new CustomError('fetch bridge unavailable', 'FETCH_BRIDGE'),
          thread,
        ),
      ),
      thread,
    );

    expect(roundTripped).toBeInstanceOf(CustomError);
    expect(roundTripped).toMatchObject({
      message: 'fetch bridge unavailable',
      code: 'FETCH_BRIDGE',
    });
  });

  it('should reject thread calls with the real error when the export throws an uncloneable exception', async () => {
    const callingThread = createExplodingThreadPair();

    await expect(callingThread.imports.explode()).rejects.toMatchObject({
      name: 'NS_ERROR_FAILURE',
      message:
        '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]',
    });
  });
});
