import { CustomError } from 'twenty-shared/utils';

import { buildClonableErrorPayload } from '../buildClonableErrorPayload';

class FakeGeckoException {
  name = 'NS_ERROR_FAILURE';
  message = '';
  stack = '@blob:null/uuid:5:15';

  toString(): string {
    return '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]';
  }
}

describe('buildClonableErrorPayload', () => {
  it('should flatten an Error to name, message and stack', () => {
    const error = new Error('boom');

    expect(buildClonableErrorPayload(error)).toEqual({
      name: 'Error',
      message: 'boom',
      stack: error.stack,
      code: undefined,
    });
  });

  it('should carry the code of a CustomError', () => {
    const error = new CustomError('fetch bridge unavailable', 'FETCH_BRIDGE');

    expect(buildClonableErrorPayload(error)).toMatchObject({
      message: 'fetch bridge unavailable',
      code: 'FETCH_BRIDGE',
    });
  });

  it('should fall back to the stringified value when the message is empty', () => {
    expect(buildClonableErrorPayload(new FakeGeckoException())).toEqual({
      name: 'NS_ERROR_FAILURE',
      message:
        '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]',
      stack: '@blob:null/uuid:5:15',
      code: undefined,
    });
  });

  it('should stringify values that are not error-like', () => {
    expect(buildClonableErrorPayload('exploded')).toEqual({
      name: 'Error',
      message: 'exploded',
    });
  });

  it('should produce a structured-cloneable payload', () => {
    expect(() =>
      structuredClone(buildClonableErrorPayload(new FakeGeckoException())),
    ).not.toThrow();
  });
});
