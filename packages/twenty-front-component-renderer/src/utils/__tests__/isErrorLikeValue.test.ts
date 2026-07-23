import { CustomError } from 'twenty-shared/utils';

import { isErrorLikeValue } from '../isErrorLikeValue';

class FakeGeckoException {
  name = 'NS_ERROR_FAILURE';
  message = '';
  stack = '@blob:null/uuid:5:15';

  toString(): string {
    return '[Exception... "Failure"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"]';
  }
}

describe('isErrorLikeValue', () => {
  it('should match Error instances', () => {
    expect(isErrorLikeValue(new Error('boom'))).toBe(true);
  });

  it('should match Error subclasses', () => {
    expect(isErrorLikeValue(new CustomError('boom', 'BOOM_CODE'))).toBe(true);
  });

  it('should match DOMException instances', () => {
    expect(isErrorLikeValue(new DOMException('denied', 'SecurityError'))).toBe(
      true,
    );
  });

  it('should match foreign exception objects exposing name, message and stack strings', () => {
    expect(isErrorLikeValue(new FakeGeckoException())).toBe(true);
  });

  it('should not match plain objects missing a stack', () => {
    expect(isErrorLikeValue({ name: 'Error', message: 'boom' })).toBe(false);
  });

  it('should not match plain data objects', () => {
    expect(
      isErrorLikeValue({ url: 'https://example.com', method: 'GET' }),
    ).toBe(false);
  });

  it('should not match primitives', () => {
    expect(isErrorLikeValue('boom')).toBe(false);
    expect(isErrorLikeValue(42)).toBe(false);
    expect(isErrorLikeValue(null)).toBe(false);
    expect(isErrorLikeValue(undefined)).toBe(false);
  });
});
