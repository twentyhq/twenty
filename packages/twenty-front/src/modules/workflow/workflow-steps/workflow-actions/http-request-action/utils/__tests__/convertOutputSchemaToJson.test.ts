import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { convertOutputSchemaToJson } from '../convertOutputSchemaToJson';

describe('convertOutputSchemaToJson', () => {
  it('should convert simple object schema to JSON', () => {
    const schema: BaseOutputSchema = {
      name: {
        isLeaf: true,
        type: 'string',
        label: 'name',
        value: 'John',
        icon: 'IconText',
      },
      age: {
        isLeaf: true,
        type: 'number',
        label: 'age',
        value: 25,
        icon: 'IconNumber',
      },
      isActive: {
        isLeaf: true,
        type: 'boolean',
        label: 'isActive',
        value: true,
        icon: 'IconCheckbox',
      },
    };
    const expected = {
      name: 'John',
      age: 25,
      isActive: true,
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should convert array schema to JSON array', () => {
    const schema: BaseOutputSchema = {
      '0': {
        isLeaf: true,
        type: 'string',
        label: '0',
        value: 'first',
        icon: 'IconText',
      },
      '1': {
        isLeaf: true,
        type: 'string',
        label: '1',
        value: 'second',
        icon: 'IconText',
      },
      '2': {
        isLeaf: true,
        type: 'string',
        label: '2',
        value: 'third',
        icon: 'IconText',
      },
    };
    const expected = ['first', 'second', 'third'];
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should convert nested object schema to JSON', () => {
    const schema: BaseOutputSchema = {
      user: {
        isLeaf: false,
        label: 'user',
        value: {
          name: {
            isLeaf: true,
            type: 'string',
            label: 'name',
            value: 'John',
            icon: 'IconText',
          },
          age: {
            isLeaf: true,
            type: 'number',
            label: 'age',
            value: 25,
            icon: 'IconNumber',
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
                icon: 'IconText',
              },
              country: {
                isLeaf: true,
                type: 'string',
                label: 'country',
                value: 'USA',
                icon: 'IconText',
              },
            },
            icon: 'IconBox',
          },
        },
        icon: 'IconBox',
      },
    };
    const expected = {
      user: {
        name: 'John',
        age: 25,
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should convert nested array schema to JSON', () => {
    const schema: BaseOutputSchema = {
      '0': {
        isLeaf: false,
        label: '0',
        value: {
          '0': {
            isLeaf: true,
            type: 'number',
            label: '0',
            value: 1,
            icon: 'IconNumber',
          },
          '1': {
            isLeaf: true,
            type: 'number',
            label: '1',
            value: 2,
            icon: 'IconNumber',
          },
        },
        icon: 'IconBox',
      },
      '1': {
        isLeaf: false,
        label: '1',
        value: {
          '0': {
            isLeaf: true,
            type: 'number',
            label: '0',
            value: 3,
            icon: 'IconNumber',
          },
          '1': {
            isLeaf: true,
            type: 'number',
            label: '1',
            value: 4,
            icon: 'IconNumber',
          },
        },
        icon: 'IconBox',
      },
    };
    const expected = [
      [1, 2],
      [3, 4],
    ];
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle mixed array and object schema', () => {
    const schema: BaseOutputSchema = {
      users: {
        isLeaf: false,
        label: 'users',
        value: {
          '0': {
            isLeaf: false,
            label: '0',
            value: {
              name: {
                isLeaf: true,
                type: 'string',
                label: 'name',
                value: 'John',
                icon: 'IconText',
              },
              age: {
                isLeaf: true,
                type: 'number',
                label: 'age',
                value: 25,
                icon: 'IconNumber',
              },
            },
            icon: 'IconBox',
          },
          '1': {
            isLeaf: false,
            label: '1',
            value: {
              name: {
                isLeaf: true,
                type: 'string',
                label: 'name',
                value: 'Jane',
                icon: 'IconText',
              },
              age: {
                isLeaf: true,
                type: 'number',
                label: 'age',
                value: 30,
                icon: 'IconNumber',
              },
            },
            icon: 'IconBox',
          },
        },
        icon: 'IconBox',
      },
      metadata: {
        isLeaf: false,
        label: 'metadata',
        value: {
          count: {
            isLeaf: true,
            type: 'number',
            label: 'count',
            value: 2,
            icon: 'IconNumber',
          },
          active: {
            isLeaf: true,
            type: 'boolean',
            label: 'active',
            value: true,
            icon: 'IconCheckbox',
          },
        },
        icon: 'IconBox',
      },
    };
    const expected = {
      users: [
        {
          name: 'John',
          age: 25,
        },
        {
          name: 'Jane',
          age: 30,
        },
      ],
      metadata: {
        count: 2,
        active: true,
      },
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle null values', () => {
    const schema: BaseOutputSchema = {
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
    const expected = {
      name: null,
      age: null,
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle empty object schema', () => {
    const schema: BaseOutputSchema = {};
    const expected = {};
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle complex nested structure', () => {
    const schema: BaseOutputSchema = {
      data: {
        isLeaf: false,
        label: 'data',
        value: {
          users: {
            isLeaf: false,
            label: 'users',
            value: {
              '0': {
                isLeaf: false,
                label: '0',
                value: {
                  id: {
                    isLeaf: true,
                    type: 'number',
                    label: 'id',
                    value: 1,
                    icon: 'IconNumber',
                  },
                  name: {
                    isLeaf: true,
                    type: 'string',
                    label: 'name',
                    value: 'John',
                    icon: 'IconText',
                  },
                  roles: {
                    isLeaf: false,
                    label: 'roles',
                    value: {
                      '0': {
                        isLeaf: true,
                        type: 'string',
                        label: '0',
                        value: 'admin',
                        icon: 'IconText',
                      },
                      '1': {
                        isLeaf: true,
                        type: 'string',
                        label: '1',
                        value: 'user',
                        icon: 'IconText',
                      },
                    },
                    icon: 'IconBox',
                  },
                  settings: {
                    isLeaf: false,
                    label: 'settings',
                    value: {
                      theme: {
                        isLeaf: true,
                        type: 'string',
                        label: 'theme',
                        value: 'dark',
                        icon: 'IconText',
                      },
                      notifications: {
                        isLeaf: true,
                        type: 'boolean',
                        label: 'notifications',
                        value: true,
                        icon: 'IconCheckbox',
                      },
                    },
                    icon: 'IconBox',
                  },
                },
                icon: 'IconBox',
              },
            },
            icon: 'IconBox',
          },
          metadata: {
            isLeaf: false,
            label: 'metadata',
            value: {
              total: {
                isLeaf: true,
                type: 'number',
                label: 'total',
                value: 1,
                icon: 'IconNumber',
              },
              page: {
                isLeaf: true,
                type: 'number',
                label: 'page',
                value: 1,
                icon: 'IconNumber',
              },
            },
            icon: 'IconBox',
          },
        },
        icon: 'IconBox',
      },
    };
    const expected = {
      data: {
        users: [
          {
            id: 1,
            name: 'John',
            roles: ['admin', 'user'],
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        ],
        metadata: {
          total: 1,
          page: 1,
        },
      },
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });
});
