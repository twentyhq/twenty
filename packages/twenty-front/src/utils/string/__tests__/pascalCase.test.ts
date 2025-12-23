import { pascalCase } from '~/utils/string/pascalCase';

describe('pascalCase', () => {
  it('converts a string to pascal case', () => {
    // Given
    const input = 'HELLO_WORLD';

    // When
    const result = pascalCase(input);

    // Then
    expect(result).toBe('HelloWorld');
  });

  it('handles empty strings', () => {
    // Given
    const input = '';

    // When
    const result = pascalCase(input);

    // Then
    expect(result).toBe('');
  });

  it('handles strings with only one word', () => {
    // Given
    const input = 'hello';

    // When
    const result = pascalCase(input);

    // Then
    expect(result).toBe('Hello');
  });

  it('handles strings with several words, spaces and special characters', () => {
    // Given
    const input = '& Hello world! How are you today? #';

    // When
    const result = pascalCase(input);

    // Then
    expect(result).toBe('HelloWorldHowAreYouToday');
  });

  it('handles strings with leading and trailing spaces', () => {
    // Given
    const input = '  hello_world  ';

    // When
    const result = pascalCase(input);

    // Then
    expect(result).toBe('HelloWorld');
  });
});
