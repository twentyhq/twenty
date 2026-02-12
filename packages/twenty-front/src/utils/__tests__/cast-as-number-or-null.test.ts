import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

describe('canBeCastAsNumberOrNull', () => {
  it(`should return true if null`, () => {
    expect(canBeCastAsNumberOrNull(null)).toBeTruthy();
  });

  it(`should return true if number`, () => {
    expect(canBeCastAsNumberOrNull(9)).toBeTruthy();
  });

  it(`should return true if empty string`, () => {
    expect(canBeCastAsNumberOrNull('')).toBeTruthy();
  });

  it(`should return true if integer string`, () => {
    expect(canBeCastAsNumberOrNull('9')).toBeTruthy();
  });

  it(`should return false if undefined`, () => {
    expect(canBeCastAsNumberOrNull(undefined)).toBeFalsy();
  });

  it(`should return false if non numeric string`, () => {
    expect(canBeCastAsNumberOrNull('9a')).toBeFalsy();
  });

  it(`should return false if non numeric string #2`, () => {
    expect(canBeCastAsNumberOrNull('a9a')).toBeFalsy();
  });

  it(`should return true if float`, () => {
    expect(canBeCastAsNumberOrNull(0.9)).toBeTruthy();
  });

  it(`should return true if float string`, () => {
    expect(canBeCastAsNumberOrNull('0.9')).toBeTruthy();
  });
});

describe('castAsNumberOrNull', () => {
  it(`should cast null to null`, () => {
    expect(castAsNumberOrNull(null)).toBe(null);
  });

  it(`should cast empty string to null`, () => {
    expect(castAsNumberOrNull('')).toBe(null);
  });

  it(`should cast an integer to an integer`, () => {
    expect(castAsNumberOrNull(9)).toBe(9);
  });

  it(`should cast an integer string to an integer`, () => {
    expect(castAsNumberOrNull('9')).toBe(9);
  });

  it(`should throw if trying to cast a float string to an integer`, () => {
    expect(castAsNumberOrNull('9.9')).toBe(9.9);
  });

  it(`should throw if trying to cast a non numeric string to an integer`, () => {
    expect(() => castAsNumberOrNull('9.9a')).toThrow(Error);
  });

  it(`should throw if trying to cast an undefined to an integer`, () => {
    expect(() => castAsNumberOrNull(undefined)).toThrow(Error);
  });
});
