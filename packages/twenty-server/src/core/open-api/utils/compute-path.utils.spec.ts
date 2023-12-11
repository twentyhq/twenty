import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import {
  computeDepthParameters,
  computeFilterParameters,
  computeLastCursorParameters,
  computeLimitParameters,
  computeNodeExample,
  computeNodeProperties,
  computeOrderByParameters,
  getResponses,
} from 'src/core/open-api/utils/compute-path.utils';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

const item: DeepPartial<ObjectMetadataEntity> = objectMetadataItem;

describe('computePathUtils', () => {
  describe('computeNodeProperties', () => {
    it('should compute node properties', () => {
      expect(computeNodeProperties(item as ObjectMetadataEntity)).toEqual({
        fieldCurrency: {
          items: {},
          type: 'string',
        },
        fieldLink: {
          items: {},
          type: 'string',
        },
        fieldNumber: {
          items: {},
          type: 'number',
        },
        fieldString: {
          items: {},
          type: 'string',
        },
      });
    });
  });
  describe('computeNodeExample', () => {
    it('should compute node example', () => {
      expect(computeNodeExample(item as ObjectMetadataEntity)).toEqual({
        fieldCurrency: {
          amountMicros: 'fieldCurrencyAmountMicros',
          currencyCode: 'fieldCurrencyCurrencyCode',
        },
        fieldLink: {
          label: 'fieldLinkLabel',
          url: 'fieldLinkUrl',
        },
        fieldNumber: 'fieldNumber',
        fieldString: 'fieldString',
      });
    });
  });
  describe('computeParameters', () => {
    describe('computeLimit', () => {
      expect(computeLimitParameters(item as ObjectMetadataEntity)).toEqual({
        name: 'limit',
        in: 'query',
        description:
          'Integer value to limit the number of `objectsName` returned',
        required: false,
        schema: {
          type: 'integer',
          minimum: 0,
          maximum: 60,
          default: 60,
        },
      });
    });
    describe('computeOrderBy', () => {
      expect(computeOrderByParameters(item as ObjectMetadataEntity)).toEqual({
        name: 'order_by',
        in: 'query',
        description:
          'A combination of fields and directions to sort `objectsName` returned. Should have the following shape: `field_name_1[DIRECTION_1],field_name_2[DIRECTION_2],...` Available directions are `AscNullsFirst`, `AscNullsLast`, `DescNullsFirst`, `DescNullsLast`. eg: GET /rest/companies?order_by=name[AscNullsFirst],createdAt[DescNullsLast]',
        required: false,
        schema: {
          type: 'string',
        },
      });
    });
    describe('computeDepth', () => {
      expect(computeDepthParameters(item as ObjectMetadataEntity)).toEqual({
        name: 'depth',
        in: 'query',
        description:
          'Integer value to limit the depth of related objects of `objectsName` returned',
        required: false,
        schema: {
          type: 'integer',
          enum: [1, 2],
        },
      });
    });
    describe('computeFilter', () => {
      expect(computeFilterParameters(item as ObjectMetadataEntity)).toEqual({
        name: 'filter',
        in: 'query',
        description:
          'A combination of fields, filter operations and values to filter `objectsName` returned',
        required: false,
        schema: {
          type: 'string',
        },
      });
    });
    describe('computeLastCursor', () => {
      expect(computeLastCursorParameters(item as ObjectMetadataEntity)).toEqual(
        {
          name: 'last_cursor',
          in: 'query',
          description:
            'Used to return `objectsName` starting from a specific cursor',
          required: false,
          schema: {
            type: 'string',
          },
        },
      );
    });
  });
  describe('getResponses', () => {
    expect(getResponses(item as ObjectMetadataEntity)).toEqual({
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    objectsName: {
                      type: 'object',
                      properties: {
                        edges: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              node: {
                                type: 'object',
                                properties: {
                                  fieldNumber: {
                                    type: 'number',
                                    items: {},
                                  },
                                  fieldString: {
                                    type: 'string',
                                    items: {},
                                  },
                                  fieldLink: {
                                    type: 'string',
                                    items: {},
                                  },
                                  fieldCurrency: {
                                    type: 'string',
                                    items: {},
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              example: {
                data: {
                  objectsName: {
                    edges: [
                      {
                        node: {
                          fieldNumber: 'fieldNumber',
                          fieldString: 'fieldString',
                          fieldLink: {
                            label: 'fieldLinkLabel',
                            url: 'fieldLinkUrl',
                          },
                          fieldCurrency: {
                            amountMicros: 'fieldCurrencyAmountMicros',
                            currencyCode: 'fieldCurrencyCurrencyCode',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      '400': {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      '401': {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    });
  });
});
