import {
  canBeCastAsPositiveIntegerOrNull,
  castAsPositiveIntegerOrNull,
} from '~/utils/cast-as-positive-integer-or-null';

describe('canBeCastAsPositiveIntegerOrNull', () => {
  it(`should return true if null`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(null)).toBeTruthy();
  });

  it(`should return true if positive number`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(9)).toBeTruthy();
  });

  it(`should return false if negative number`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(-9)).toBeFalsy();
  });

  it(`should return true if zero`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(0)).toBeTruthy();
  });

  it(`should return true if string 0`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('0')).toBeTruthy();
  });

  it(`should return false if negative float`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(-1.22)).toBeFalsy();
  });

  it(`should return false if positive float`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(1.22)).toBeFalsy();
  });

  it(`should return false if positive float string`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('0.9')).toBeFalsy();
  });

  it(`should return false if negative float string`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('-0.9')).toBeFalsy();
  });

  it(`should return false if less than 1`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(0.22)).toBeFalsy();
  });

  it(`should return true if empty string`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('')).toBeTruthy();
  });

  it(`should return true if integer string`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('9')).toBeTruthy();
  });

  it(`should return false if undefined`, () => {
    expect(canBeCastAsPositiveIntegerOrNull(undefined)).toBeFalsy();
  });

  it(`should return false if non numeric string`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('9a')).toBeFalsy();
  });

  it(`should return false if non numeric string #2`, () => {
    expect(canBeCastAsPositiveIntegerOrNull('a9a')).toBeFalsy();
  });
});

describe('castAsPositiveIntegerOrNull', () => {
  it(`should cast null to null`, () => {
    expect(castAsPositiveIntegerOrNull(null)).toBe(null);
  });

  it(`should cast empty string to null`, () => {
    expect(castAsPositiveIntegerOrNull('')).toBe(null);
  });

  it(`should cast an integer to positive integer`, () => {
    expect(castAsPositiveIntegerOrNull(9)).toBe(9);
  });

  it(`should cast an integer string to positive integer`, () => {
    expect(castAsPositiveIntegerOrNull('9')).toBe(9);
  });

  it(`should cast an integer to zero integer`, () => {
    expect(castAsPositiveIntegerOrNull(0)).toBe(0);
  });

  it(`should cast an integer string to zero integer`, () => {
    expect(castAsPositiveIntegerOrNull('0')).toBe(0);
  });

  it(`should throw if trying to cast a positive float string to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull('9.9')).toThrow(Error);
  });

  it(`should throw if trying to cast a negative float string to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull('-9.9')).toThrow(Error);
  });

  it(`should throw if trying to cast a positive float to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull(9.9)).toThrow(Error);
  });

  it(`should throw if trying to cast a negative float to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull(-9.9)).toThrow(Error);
  });

  it(`should throw if trying to cast a non numeric string to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull('9.9a')).toThrow(Error);
  });

  it(`should throw if trying to cast an undefined to positive integer`, () => {
    expect(() => castAsPositiveIntegerOrNull(undefined)).toThrow(Error);
  });
});
