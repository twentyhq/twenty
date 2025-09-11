import { isHandleEqual } from '../isHandleEqual';

describe('isHandleEqual', () => {
  describe('when both handles are defined strings', () => {
    it('should return true when handles are the same string', () => {
      expect(isHandleEqual('handle1', 'handle1')).toBe(true);
    });

    it('should return false when handles are different strings', () => {
      expect(isHandleEqual('handle1', 'handle2')).toBe(false);
    });

    it('should return true when both handles are empty strings', () => {
      expect(isHandleEqual('', '')).toBe(true);
    });

    it('should return false when one handle is empty and the other is not', () => {
      expect(isHandleEqual('', 'handle1')).toBe(false);
      expect(isHandleEqual('handle1', '')).toBe(false);
    });
  });

  describe('when handles are null', () => {
    it('should return true when both handles are null', () => {
      expect(isHandleEqual(null, null)).toBe(true);
    });

    it('should return false when one handle is null and the other is a string', () => {
      expect(isHandleEqual(null, 'handle1')).toBe(false);
      expect(isHandleEqual('handle1', null)).toBe(false);
    });
  });

  describe('when handles are undefined', () => {
    it('should return true when both handles are undefined', () => {
      expect(isHandleEqual(undefined, undefined)).toBe(true);
    });

    it('should return false when one handle is undefined and the other is a string', () => {
      expect(isHandleEqual(undefined, 'handle1')).toBe(false);
      expect(isHandleEqual('handle1', undefined)).toBe(false);
    });
  });

  describe('when handles are mixed null and undefined', () => {
    it('should return true when one handle is null and the other is undefined', () => {
      expect(isHandleEqual(null, undefined)).toBe(true);
      expect(isHandleEqual(undefined, null)).toBe(true);
    });
  });
});
