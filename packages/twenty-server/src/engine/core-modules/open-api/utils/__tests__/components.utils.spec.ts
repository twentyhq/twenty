import { computeSchemaComponents } from 'src/engine/core-modules/open-api/utils/components.utils';
import {
  fields,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('computeSchemaComponents', () => {
  it('should test all field types', () => {
    expect(fields.map((field) => field.type)).toEqual(
      Object.keys(FieldMetadataType),
    );
  });
  it('should compute schema components', () => {
    expect(
      computeSchemaComponents([
        objectMetadataItemMock,
      ] as ObjectMetadataEntity[]),
    ).toEqual({
      ObjectName: {
        type: 'object',
        description: undefined,
        required: ['fieldNumber'],
        example: { fieldNumber: '' },
        properties: {
          fieldUuid: {
            type: 'string',
            format: 'uuid',
          },
          fieldText: {
            type: 'string',
          },
          fieldPhone: {
            type: 'string',
          },
          fieldEmail: {
            type: 'string',
            format: 'email',
          },
          fieldDateTime: {
            type: 'string',
            format: 'date',
          },
          fieldDate: {
            type: 'string',
            format: 'date',
          },
          fieldBoolean: {
            type: 'boolean',
          },
          fieldNumber: {
            type: 'integer',
          },
          fieldNumeric: {
            type: 'number',
          },
          fieldProbability: {
            type: 'number',
          },
          fieldLink: {
            properties: {
              label: { type: 'string' },
              url: { type: 'string' },
            },
            type: 'object',
          },
          fieldLinks: {
            properties: {
              primaryLinkLabel: { type: 'string' },
              primaryLinkUrl: { type: 'string' },
              secondaryLinks: { type: 'object' },
            },
            type: 'object',
          },
          fieldCurrency: {
            properties: {
              amountMicros: { type: 'number' },
              currencyCode: { type: 'string' },
            },
            type: 'object',
          },
          fieldFullName: {
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
            },
            type: 'object',
          },
          fieldRating: {
            type: 'number',
          },
          fieldSelect: {
            type: 'string',
            enum: ['OPTION_1', 'OPTION_2'],
          },
          fieldMultiSelect: {
            type: 'string',
            enum: ['OPTION_1', 'OPTION_2'],
          },
          fieldPosition: {
            type: 'number',
          },
          fieldAddress: {
            properties: {
              addressCity: {
                type: 'string',
              },
              addressCountry: {
                type: 'string',
              },
              addressLat: {
                type: 'number',
              },
              addressLng: {
                type: 'number',
              },
              addressPostcode: {
                type: 'string',
              },
              addressState: {
                type: 'string',
              },
              addressStreet1: {
                type: 'string',
              },
              addressStreet2: {
                type: 'string',
              },
            },
            type: 'object',
          },
          fieldRawJson: {
            type: 'object',
          },
        },
      },
      'ObjectName with Relations': {
        allOf: [
          {
            $ref: '#/components/schemas/ObjectName',
          },
          {
            properties: {
              fieldRelation: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ToObjectMetadataName',
                },
              },
            },
            type: 'object',
          },
        ],
        description: undefined,
        example: {
          fieldNumber: '',
        },
        required: ['fieldNumber'],
      },
    });
  });
});
