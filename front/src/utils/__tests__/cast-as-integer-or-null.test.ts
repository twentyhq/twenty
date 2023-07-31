import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '../cast-as-integer-or-null';

describe('canBeCastAsIntegerOrNull', () => {
  it(`should return true if null`, () => {
    expect(canBeCastAsIntegerOrNull(null)).toBeTruthy();
  });

  it(`should return true if number`, () => {
    expect(canBeCastAsIntegerOrNull(9)).toBeTruthy();
  });

  it(`should return true if empty string`, () => {
    expect(canBeCastAsIntegerOrNull('')).toBeTruthy();
  });

  it(`should return true if integer string`, () => {
    expect(canBeCastAsIntegerOrNull('9')).toBeTruthy();
  });

  it(`should return false if undefined`, () => {
    expect(canBeCastAsIntegerOrNull(undefined)).toBeFalsy();
  });

  it(`should return false if non numeric string`, () => {
    expect(canBeCastAsIntegerOrNull('9a')).toBeFalsy();
  });

  it(`should return false if non numeric string #2`, () => {
    expect(canBeCastAsIntegerOrNull('a9a')).toBeFalsy();
  });

  it(`should return false if float`, () => {
    expect(canBeCastAsIntegerOrNull(0.9)).toBeFalsy();
  });

  it(`should return false if float string`, () => {
    expect(canBeCastAsIntegerOrNull('0.9')).toBeFalsy();
  });
});

describe('castAsIntegerOrNull', () => {
  it(`should cast null to null`, () => {
    expect(castAsIntegerOrNull(null)).toBe(null);
  });

  it(`should cast empty string to null`, () => {
    expect(castAsIntegerOrNull('')).toBe(null);
  });

  it(`should cast an integer to an integer`, () => {
    expect(castAsIntegerOrNull(9)).toBe(9);
  });

  it(`should cast an integer string to an integer`, () => {
    expect(castAsIntegerOrNull('9')).toBe(9);
  });

  it(`should throw if trying to cast a float string to an integer`, () => {
    expect(() => castAsIntegerOrNull('9.9')).toThrow(Error);
  });

  it(`should throw if trying to cast a non numeric string to an integer`, () => {
    expect(() => castAsIntegerOrNull('9.9a')).toThrow(Error);
  });

  it(`should throw if trying to cast an undefined to an integer`, () => {
    expect(() => castAsIntegerOrNull(undefined)).toThrow(Error);
  });
});
