import { cleanEntityName } from 'src/engine/api/graphql/workspace-schema-builder/utils/clean-entity-name.util';

describe('cleanEntityName', () => {
  test('should camelCase strings', () => {
    expect(cleanEntityName('hello world')).toBe('helloWorld');
    expect(cleanEntityName('my name is John')).toBe('myNameIsJohn');
  });

  test('should remove numbers at the beginning', () => {
    expect(cleanEntityName('123hello')).toBe('hello');
    expect(cleanEntityName('456hello world')).toBe('helloWorld');
  });

  test('should remove special characters', () => {
    expect(cleanEntityName('hello$world')).toBe('helloWorld');
    expect(cleanEntityName('some#special&chars')).toBe('someSpecialChars');
  });

  test('should handle empty strings', () => {
    expect(cleanEntityName('')).toBe('');
  });
});
