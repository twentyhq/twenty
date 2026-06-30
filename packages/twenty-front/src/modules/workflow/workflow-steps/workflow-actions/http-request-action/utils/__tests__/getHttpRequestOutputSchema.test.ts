import { getHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getHttpRequestOutputSchema';

describe('getHttpRequestOutputSchema', () => {
  it('should return empty object for null input', () => {
    expect(getHttpRequestOutputSchema(null)).toEqual({});
  });

  it('should return empty object for undefined input', () => {
    expect(getHttpRequestOutputSchema(undefined)).toEqual({});
  });

  it('should return empty object for non-object input', () => {
    expect(getHttpRequestOutputSchema('string')).toEqual({});
    expect(getHttpRequestOutputSchema(123)).toEqual({});
    expect(getHttpRequestOutputSchema(true)).toEqual({});
  });

  it('should handle string values correctly', () => {
    const input = { name: 'John', email: 'john@example.com' };
    const expected = {
      name: {
        isLeaf: true,
        type: 'string',
        label: 'name',
        value: 'John',
      },
      email: {
        isLeaf: true,
        type: 'string',
        label: 'email',
        value: 'john@example.com',
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle number values correctly', () => {
    const input = { age: 25, score: 98.5 };
    const expected = {
      age: {
        isLeaf: true,
        type: 'number',
        label: 'age',
        value: 25,
      },
      score: {
        isLeaf: true,
        type: 'number',
        label: 'score',
        value: 98.5,
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle boolean values correctly', () => {
    const input = { isActive: true, isVerified: false };
    const expected = {
      isActive: {
        isLeaf: true,
        type: 'boolean',
        label: 'isActive',
        value: true,
      },
      isVerified: {
        isLeaf: true,
        type: 'boolean',
        label: 'isVerified',
        value: false,
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle nested objects correctly', () => {
    const input = {
      user: {
        name: 'John',
        age: 25,
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
    };
    const expected = {
      user: {
        isLeaf: false,
        label: 'user',
        type: 'object',
        value: {
          name: {
            isLeaf: true,
            type: 'string',
            label: 'name',
            value: 'John',
          },
          age: {
            isLeaf: true,
            type: 'number',
            label: 'age',
            value: 25,
          },
          address: {
            isLeaf: false,
            label: 'address',
            type: 'object',
            value: {
              city: {
                isLeaf: true,
                type: 'string',
                label: 'city',
                value: 'New York',
              },
              country: {
                isLeaf: true,
                type: 'string',
                label: 'country',
                value: 'USA',
              },
            },
          },
        },
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle arrays correctly', () => {
    const input = {
      tags: ['tag1', 'tag2'],
      scores: [1, 2, 3],
      flags: [true, false],
    };
    const expected = {
      tags: {
        isLeaf: true,
        label: 'tags',
        type: 'array',
        value: ['tag1', 'tag2'],
      },
      scores: {
        isLeaf: true,
        label: 'scores',
        type: 'array',
        value: [1, 2, 3],
      },
      flags: {
        isLeaf: true,
        label: 'flags',
        type: 'array',
        value: [true, false],
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle null values correctly', () => {
    const input = { name: null, age: null };
    const expected = {
      name: {
        isLeaf: true,
        type: 'unknown',
        label: 'name',
        value: null,
      },
      age: {
        isLeaf: true,
        type: 'unknown',
        label: 'age',
        value: null,
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });

  it('should handle mixed type values correctly', () => {
    const input = {
      name: 'John',
      age: 25,
      isActive: true,
      tags: ['tag1', 'tag2'],
      address: {
        city: 'New York',
        zip: 10001,
      },
      metadata: null,
    };
    const expected = {
      name: {
        isLeaf: true,
        type: 'string',
        label: 'name',
        value: 'John',
      },
      age: {
        isLeaf: true,
        type: 'number',
        label: 'age',
        value: 25,
      },
      isActive: {
        isLeaf: true,
        type: 'boolean',
        label: 'isActive',
        value: true,
      },
      tags: {
        isLeaf: true,
        label: 'tags',
        type: 'array',
        value: ['tag1', 'tag2'],
      },
      address: {
        isLeaf: false,
        label: 'address',
        type: 'object',
        value: {
          city: {
            isLeaf: true,
            type: 'string',
            label: 'city',
            value: 'New York',
          },
          zip: {
            isLeaf: true,
            type: 'number',
            label: 'zip',
            value: 10001,
          },
        },
      },
      metadata: {
        isLeaf: true,
        type: 'unknown',
        label: 'metadata',
        value: null,
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });
});
