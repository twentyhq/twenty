import { castToString } from '~/utils/castToString';

it('returns an empty string when undefined is provided', () => {
  expect(castToString(undefined)).toBe('');
});

it('returns an empty string when null is provided', () => {
  expect(castToString(undefined)).toBe('');
});

it('returns an empty string when an empty string is provided', () => {
  expect(castToString('')).toBe('');
});

it('preserves strings', () => {
  expect(castToString('test')).toBe('test');
});

it('casts numbers to strings', () => {
  expect(castToString(21)).toBe('21');
});

it('casts booleans to strings', () => {
  expect(castToString(true)).toBe('true');
});
