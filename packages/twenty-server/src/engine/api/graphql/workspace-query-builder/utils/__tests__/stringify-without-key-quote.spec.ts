import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';

describe('stringifyWithoutKeyQuote', () => {
  test('should stringify object correctly without quotes around keys', () => {
    const obj = { name: 'John', age: 30, isAdmin: false };
    const result = stringifyWithoutKeyQuote(obj);

    expect(result).toBe('{name:"John",age:30,isAdmin:false}');
  });

  test('should handle nested objects', () => {
    const obj = {
      name: 'John',
      age: 30,
      address: { city: 'New York', zipCode: 10001 },
    };
    const result = stringifyWithoutKeyQuote(obj);

    expect(result).toBe(
      '{name:"John",age:30,address:{city:"New York",zipCode:10001}}',
    );
  });

  test('should handle arrays', () => {
    const obj = {
      name: 'John',
      age: 30,
      hobbies: ['reading', 'movies', 'hiking'],
    };
    const result = stringifyWithoutKeyQuote(obj);

    expect(result).toBe(
      '{name:"John",age:30,hobbies:["reading","movies","hiking"]}',
    );
  });

  test('should handle empty objects', () => {
    const obj = {};
    const result = stringifyWithoutKeyQuote(obj);

    expect(result).toBe('{}');
  });

  test('should handle numbers, strings, and booleans', () => {
    const num = 10;
    const str = 'Hello';
    const bool = false;

    expect(stringifyWithoutKeyQuote(num)).toBe('10');
    expect(stringifyWithoutKeyQuote(str)).toBe('"Hello"');
    expect(stringifyWithoutKeyQuote(bool)).toBe('false');
  });

  test('should handle null and undefined', () => {
    expect(stringifyWithoutKeyQuote(null)).toBe('null');
    expect(stringifyWithoutKeyQuote(undefined)).toBe(undefined);
  });
});
