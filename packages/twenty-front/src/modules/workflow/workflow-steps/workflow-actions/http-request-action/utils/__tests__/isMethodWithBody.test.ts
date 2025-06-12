import { HttpMethodWithBody } from '../../constants/HttpRequest';
import { isMethodWithBody } from '../isMethodWithBody';

describe('isMethodWithBody', () => {
  it('should return false for null input', () => {
    expect(isMethodWithBody(null)).toBe(false);
  });

  it('should return false for undefined input', () => {
    expect(isMethodWithBody(undefined as unknown as string)).toBe(false);
  });

  it('should return false for non-body methods', () => {
    expect(isMethodWithBody('GET')).toBe(false);
    expect(isMethodWithBody('HEAD')).toBe(false);
    expect(isMethodWithBody('OPTIONS')).toBe(false);
  });

  it('should return true for methods with body', () => {
    const methodsWithBody: HttpMethodWithBody[] = ['POST', 'PUT', 'PATCH'];
    methodsWithBody.forEach((method) => {
      expect(isMethodWithBody(method)).toBe(true);
    });
  });
});
