import { isTrustedExternalOriginsByApplicationId } from '@/front-components/utils/isTrustedExternalOriginsByApplicationId';

describe('isTrustedExternalOriginsByApplicationId', () => {
  it('should accept an empty object', () => {
    expect(isTrustedExternalOriginsByApplicationId({})).toBe(true);
  });

  it('should accept a well-formed map of application id to origin list', () => {
    expect(
      isTrustedExternalOriginsByApplicationId({
        'application-1': ['https://example.com', 'https://twenty.com'],
        'application-2': [],
      }),
    ).toBe(true);
  });

  it('should reject a value whose origins are not an array', () => {
    expect(
      isTrustedExternalOriginsByApplicationId({
        'application-1': 'https://example.com',
      }),
    ).toBe(false);
  });

  it('should reject a value whose origins contain a non-string', () => {
    expect(
      isTrustedExternalOriginsByApplicationId({ 'application-1': [123] }),
    ).toBe(false);
  });

  it('should reject an array payload', () => {
    expect(
      isTrustedExternalOriginsByApplicationId(['https://example.com']),
    ).toBe(false);
  });

  it('should reject a primitive payload', () => {
    expect(isTrustedExternalOriginsByApplicationId('not-an-object')).toBe(
      false,
    );
    expect(isTrustedExternalOriginsByApplicationId(null)).toBe(false);
    expect(isTrustedExternalOriginsByApplicationId(42)).toBe(false);
  });
});
