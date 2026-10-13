import { isTextLikeInputType } from '../isTextLikeInputType';

describe('isTextLikeInputType', () => {
  it('should treat text-like input types as text-like', () => {
    expect(isTextLikeInputType('text')).toBe(true);
    expect(isTextLikeInputType('email')).toBe(true);
    expect(isTextLikeInputType('password')).toBe(true);
    expect(isTextLikeInputType('number')).toBe(true);
  });

  it('should treat a missing type as text-like', () => {
    expect(isTextLikeInputType(undefined)).toBe(true);
    expect(isTextLikeInputType('')).toBe(true);
  });

  it('should ignore casing', () => {
    expect(isTextLikeInputType('TEXT')).toBe(true);
  });

  it('should not treat non-text input types as text-like', () => {
    expect(isTextLikeInputType('checkbox')).toBe(false);
    expect(isTextLikeInputType('radio')).toBe(false);
    expect(isTextLikeInputType('file')).toBe(false);
    expect(isTextLikeInputType('button')).toBe(false);
  });
});
