import { cookieStorage } from '~/utils/cookie-storage';

describe('cookieStorage', () => {
  it('should be able to set and get a cookie', () => {
    cookieStorage.setItem('foo', 'bar');
    expect(cookieStorage.getItem('foo')).toBe('bar');
  });

  it('should return undefined for a non-existent cookie', () => {
    expect(cookieStorage.getItem('non-existent')).toBeUndefined();
  });

  it('should be able to remove a cookie', () => {
    cookieStorage.setItem('foo', 'bar');
    cookieStorage.removeItem('foo');
    expect(cookieStorage.getItem('foo')).toBeUndefined();
  });

  it('should be able to clear all cookies', () => {
    cookieStorage.setItem('foo', 'bar');
    cookieStorage.setItem('baz', 'qux');
    cookieStorage.clear();
    expect(cookieStorage.getItem('foo')).toBeUndefined();
    expect(cookieStorage.getItem('baz')).toBeUndefined();
  });
});
