import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { convertOutputSchemaToJson } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/convertOutputSchemaToJson';

describe('convertOutputSchemaToJson', () => {
  it('should convert simple object schema to JSON', () => {
    const schema: BaseOutputSchemaV2 = {
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
    };
    const expected = {
      name: 'John',
      age: 25,
      isActive: true,
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should convert array schema to JSON array', () => {
    const schema: BaseOutputSchemaV2 = {
      '0': {
        isLeaf: true,
        type: 'string',
        label: '0',
        value: 'first',
      },
      '1': {
        isLeaf: true,
        type: 'string',
        label: '1',
        value: 'second',
      },
      '2': {
        isLeaf: true,
        type: 'string',
        label: '2',
        value: 'third',
      },
    };
    const expected = ['first', 'second', 'third'];
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should convert nested object schema to JSON', () => {
    const schema: BaseOutputSchemaV2 = {
      user: {
        isLeaf: false,
        type: 'object',
        label: 'user',
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
            type: 'object',
            label: 'address',
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
    const schema: BaseOutputSchemaV2 = {
      '0': {
        isLeaf: false,
        type: 'object',
        label: '0',
        value: {
          '0': {
            isLeaf: true,
            type: 'number',
            label: '0',
            value: 1,
          },
          '1': {
            isLeaf: true,
            type: 'number',
            label: '1',
            value: 2,
          },
        },
      },
      '1': {
        isLeaf: false,
        type: 'object',
        label: '1',
        value: {
          '0': {
            isLeaf: true,
            type: 'number',
            label: '0',
            value: 3,
          },
          '1': {
            isLeaf: true,
            type: 'number',
            label: '1',
            value: 4,
          },
        },
      },
    };
    const expected = [
      [1, 2],
      [3, 4],
    ];
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle mixed array and object schema', () => {
    const schema: BaseOutputSchemaV2 = {
      users: {
        isLeaf: false,
        type: 'object',
        label: 'users',
        value: {
          '0': {
            isLeaf: false,
            type: 'object',
            label: '0',
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
            },
          },
          '1': {
            isLeaf: false,
            type: 'object',
            label: '1',
            value: {
              name: {
                isLeaf: true,
                type: 'string',
                label: 'name',
                value: 'Jane',
              },
              age: {
                isLeaf: true,
                type: 'number',
                label: 'age',
                value: 30,
              },
            },
          },
        },
      },
      metadata: {
        isLeaf: false,
        type: 'object',
        label: 'metadata',
        value: {
          count: {
            isLeaf: true,
            type: 'number',
            label: 'count',
            value: 2,
          },
          active: {
            isLeaf: true,
            type: 'boolean',
            label: 'active',
            value: true,
          },
        },
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
    const schema: BaseOutputSchemaV2 = {
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
    const expected = {
      name: null,
      age: null,
    };
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle empty object schema', () => {
    const schema: BaseOutputSchemaV2 = {};
    const expected = {};
    expect(convertOutputSchemaToJson(schema)).toEqual(expected);
  });

  it('should handle complex nested structure', () => {
    const schema: BaseOutputSchemaV2 = {
      data: {
        isLeaf: false,
        type: 'object',
        label: 'data',
        value: {
          users: {
            isLeaf: false,
            type: 'object',
            label: 'users',
            value: {
              '0': {
                isLeaf: false,
                type: 'object',
                label: '0',
                value: {
                  id: {
                    isLeaf: true,
                    type: 'number',
                    label: 'id',
                    value: 1,
                  },
                  name: {
                    isLeaf: true,
                    type: 'string',
                    label: 'name',
                    value: 'John',
                  },
                  roles: {
                    isLeaf: false,
                    type: 'object',
                    label: 'roles',
                    value: {
                      '0': {
                        isLeaf: true,
                        type: 'string',
                        label: '0',
                        value: 'admin',
                      },
                      '1': {
                        isLeaf: true,
                        type: 'string',
                        label: '1',
                        value: 'user',
                      },
                    },
                  },
                  settings: {
                    isLeaf: false,
                    type: 'object',
                    label: 'settings',
                    value: {
                      theme: {
                        isLeaf: true,
                        type: 'string',
                        label: 'theme',
                        value: 'dark',
                      },
                      notifications: {
                        isLeaf: true,
                        type: 'boolean',
                        label: 'notifications',
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
          metadata: {
            isLeaf: false,
            type: 'object',
            label: 'metadata',
            value: {
              total: {
                isLeaf: true,
                type: 'number',
                label: 'total',
                value: 1,
              },
              page: {
                isLeaf: true,
                type: 'number',
                label: 'page',
                value: 1,
              },
            },
          },
        },
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
