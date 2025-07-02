import { getHttpRequestOutputSchema } from '../getHttpRequestOutputSchema';

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
        icon: 'IconAbc',
      },
      email: {
        isLeaf: true,
        type: 'string',
        label: 'email',
        value: 'john@example.com',
        icon: 'IconAbc',
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
        icon: 'IconText',
      },
      score: {
        isLeaf: true,
        type: 'number',
        label: 'score',
        value: 98.5,
        icon: 'IconText',
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
        icon: 'IconCheckbox',
      },
      isVerified: {
        isLeaf: true,
        type: 'boolean',
        label: 'isVerified',
        value: false,
        icon: 'IconCheckbox',
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
        value: {
          name: {
            isLeaf: true,
            type: 'string',
            label: 'name',
            value: 'John',
            icon: 'IconAbc',
          },
          age: {
            isLeaf: true,
            type: 'number',
            label: 'age',
            value: 25,
            icon: 'IconText',
          },
          address: {
            isLeaf: false,
            label: 'address',
            value: {
              city: {
                isLeaf: true,
                type: 'string',
                label: 'city',
                value: 'New York',
                icon: 'IconAbc',
              },
              country: {
                isLeaf: true,
                type: 'string',
                label: 'country',
                value: 'USA',
                icon: 'IconAbc',
              },
            },
            icon: 'IconBox',
          },
        },
        icon: 'IconBox',
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
        isLeaf: false,
        label: 'tags',
        value: {
          '0': {
            isLeaf: true,
            type: 'string',
            label: '0',
            value: 'tag1',
            icon: 'IconAbc',
          },
          '1': {
            isLeaf: true,
            type: 'string',
            label: '1',
            value: 'tag2',
            icon: 'IconAbc',
          },
        },
        icon: 'IconBox',
      },
      scores: {
        isLeaf: false,
        label: 'scores',
        value: {
          '0': {
            isLeaf: true,
            type: 'number',
            label: '0',
            value: 1,
            icon: 'IconText',
          },
          '1': {
            isLeaf: true,
            type: 'number',
            label: '1',
            value: 2,
            icon: 'IconText',
          },
          '2': {
            isLeaf: true,
            type: 'number',
            label: '2',
            value: 3,
            icon: 'IconText',
          },
        },
        icon: 'IconBox',
      },
      flags: {
        isLeaf: false,
        label: 'flags',
        value: {
          '0': {
            isLeaf: true,
            type: 'boolean',
            label: '0',
            value: true,
            icon: 'IconCheckbox',
          },
          '1': {
            isLeaf: true,
            type: 'boolean',
            label: '1',
            value: false,
            icon: 'IconCheckbox',
          },
        },
        icon: 'IconBox',
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
        icon: 'IconQuestionMark',
      },
      age: {
        isLeaf: true,
        type: 'unknown',
        label: 'age',
        value: null,
        icon: 'IconQuestionMark',
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
        icon: 'IconAbc',
      },
      age: {
        isLeaf: true,
        type: 'number',
        label: 'age',
        value: 25,
        icon: 'IconText',
      },
      isActive: {
        isLeaf: true,
        type: 'boolean',
        label: 'isActive',
        value: true,
        icon: 'IconCheckbox',
      },
      tags: {
        isLeaf: false,
        label: 'tags',
        value: {
          '0': {
            isLeaf: true,
            type: 'string',
            label: '0',
            value: 'tag1',
            icon: 'IconAbc',
          },
          '1': {
            isLeaf: true,
            type: 'string',
            label: '1',
            value: 'tag2',
            icon: 'IconAbc',
          },
        },
        icon: 'IconBox',
      },
      address: {
        isLeaf: false,
        label: 'address',
        value: {
          city: {
            isLeaf: true,
            type: 'string',
            label: 'city',
            value: 'New York',
            icon: 'IconAbc',
          },
          zip: {
            isLeaf: true,
            type: 'number',
            label: 'zip',
            value: 10001,
            icon: 'IconText',
          },
        },
        icon: 'IconBox',
      },
      metadata: {
        isLeaf: true,
        type: 'unknown',
        label: 'metadata',
        value: null,
        icon: 'IconQuestionMark',
      },
    };
    expect(getHttpRequestOutputSchema(input)).toEqual(expected);
  });
});
