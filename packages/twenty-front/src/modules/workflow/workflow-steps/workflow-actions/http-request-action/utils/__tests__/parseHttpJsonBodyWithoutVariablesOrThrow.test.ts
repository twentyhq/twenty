import { parseHttpJsonBodyWithoutVariablesOrThrow } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/parseHttpJsonBodyWithoutVariablesOrThrow';

describe('parseHttpJsonBodyWithoutVariablesOrThrow', () => {
  it('should parse valid JSON without variables', () => {
    const jsonString = '{"name": "John", "age": 30, "active": true}';
    const result = parseHttpJsonBodyWithoutVariablesOrThrow(jsonString);

    expect(result).toEqual({
      name: 'John',
      age: 30,
      active: true,
    });
  });

  it('should handle nested objects with variables', () => {
    const jsonString =
      '{"user": {"name": "{{user.name}}", "email": "{{user.email}}"}}';
    const result = parseHttpJsonBodyWithoutVariablesOrThrow(jsonString);

    expect(result).toEqual({
      user: {
        name: 'null',
        email: 'null',
      },
    });
  });

  it('should handle arrays with variables', () => {
    const jsonString = '{"items": ["{{item1}}", "{{item2}}", "static"]}';
    const result = parseHttpJsonBodyWithoutVariablesOrThrow(jsonString);

    expect(result).toEqual({
      items: ['null', 'null', 'static'],
    });
  });

  it('should throw error for invalid JSON', () => {
    const invalidJson = '{"name": "John", "age": 30,}';

    expect(() => {
      parseHttpJsonBodyWithoutVariablesOrThrow(invalidJson);
    }).toThrow();
  });

  it('should handle empty object', () => {
    const jsonString = '{}';
    const result = parseHttpJsonBodyWithoutVariablesOrThrow(jsonString);

    expect(result).toEqual({});
  });

  it('should handle empty string', () => {
    expect(() => {
      parseHttpJsonBodyWithoutVariablesOrThrow('');
    }).toThrow();
  });
});
