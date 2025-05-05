import { FieldMetadataType } from 'twenty-shared/types';

import { NumberDataType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { computeSchemaComponents } from 'src/engine/core-modules/open-api/utils/components.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

describe('computeSchemaComponents', () => {
  it('should compute schema components', () => {
    expect(
      computeSchemaComponents([
        objectMetadataItemMock,
      ] as ObjectMetadataEntity[]),
    ).toEqual({
      ObjectName: {
        description: undefined,
        type: 'object',
        properties: {
          fieldUuid: {
            type: 'string',
            format: 'uuid',
          },
          fieldText: {
            type: 'string',
          },
          fieldPhones: {
            properties: {
              additionalPhones: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              primaryPhoneCountryCode: {
                type: 'string',
              },
              primaryPhoneCallingCode: {
                type: 'string',
              },
              primaryPhoneNumber: {
                type: 'string',
              },
            },
            type: 'object',
          },
          fieldEmails: {
            type: 'object',
            properties: {
              primaryEmail: {
                type: 'string',
              },
              additionalEmails: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'email',
                },
              },
            },
          },
          fieldDateTime: {
            type: 'string',
            format: 'date-time',
          },
          fieldDate: {
            type: 'string',
            format: 'date',
          },
          fieldArray: {
            items: {
              type: 'string',
            },
            type: 'array',
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
          fieldLinks: {
            type: 'object',
            properties: {
              primaryLinkLabel: {
                type: 'string',
              },
              primaryLinkUrl: {
                type: 'string',
              },
              secondaryLinks: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'A secondary link',
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                    },
                    label: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          fieldCurrency: {
            type: 'object',
            properties: {
              amountMicros: {
                type: 'number',
              },
              currencyCode: {
                type: 'string',
              },
            },
          },
          fieldFullName: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
            },
          },
          fieldRating: {
            type: 'string',
            enum: ['RATING_1', 'RATING_2'],
          },
          fieldSelect: {
            type: 'string',
            enum: ['OPTION_1', 'OPTION_2'],
          },
          fieldMultiSelect: {
            type: 'array',
            items: { type: 'string', enum: ['OPTION_1', 'OPTION_2'] },
          },
          fieldPosition: {
            type: 'number',
          },
          fieldAddress: {
            type: 'object',
            properties: {
              addressStreet1: {
                type: 'string',
              },
              addressStreet2: {
                type: 'string',
              },
              addressCity: {
                type: 'string',
              },
              addressPostcode: {
                type: 'string',
              },
              addressState: {
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
            },
          },
          fieldRawJson: {
            type: 'object',
          },
          fieldRichText: {
            type: 'string',
          },
          fieldActor: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                enum: [
                  'EMAIL',
                  'CALENDAR',
                  'WORKFLOW',
                  'API',
                  'IMPORT',
                  'MANUAL',
                  'SYSTEM',
                  'WEBHOOK',
                ],
              },
            },
          },
        },
        required: ['fieldNumber'],
      },
      'ObjectName for Update': {
        description: undefined,
        type: 'object',
        properties: {
          fieldUuid: {
            type: 'string',
            format: 'uuid',
          },
          fieldText: {
            type: 'string',
          },
          fieldPhones: {
            properties: {
              additionalPhones: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              primaryPhoneCountryCode: {
                type: 'string',
              },
              primaryPhoneCallingCode: {
                type: 'string',
              },
              primaryPhoneNumber: {
                type: 'string',
              },
            },
            type: 'object',
          },
          fieldEmails: {
            type: 'object',
            properties: {
              primaryEmail: {
                type: 'string',
              },
              additionalEmails: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'email',
                },
              },
            },
          },
          fieldDateTime: {
            type: 'string',
            format: 'date-time',
          },
          fieldDate: {
            type: 'string',
            format: 'date',
          },
          fieldArray: {
            items: {
              type: 'string',
            },
            type: 'array',
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
          fieldLinks: {
            type: 'object',
            properties: {
              primaryLinkLabel: {
                type: 'string',
              },
              primaryLinkUrl: {
                type: 'string',
              },
              secondaryLinks: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'A secondary link',
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                    },
                    label: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          fieldCurrency: {
            type: 'object',
            properties: {
              amountMicros: {
                type: 'number',
              },
              currencyCode: {
                type: 'string',
              },
            },
          },
          fieldFullName: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
            },
          },
          fieldRating: {
            type: 'string',
            enum: ['RATING_1', 'RATING_2'],
          },
          fieldSelect: {
            type: 'string',
            enum: ['OPTION_1', 'OPTION_2'],
          },
          fieldMultiSelect: {
            type: 'array',
            items: { type: 'string', enum: ['OPTION_1', 'OPTION_2'] },
          },
          fieldPosition: {
            type: 'number',
          },
          fieldAddress: {
            type: 'object',
            properties: {
              addressStreet1: {
                type: 'string',
              },
              addressStreet2: {
                type: 'string',
              },
              addressCity: {
                type: 'string',
              },
              addressPostcode: {
                type: 'string',
              },
              addressState: {
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
            },
          },
          fieldRawJson: {
            type: 'object',
          },
          fieldRichText: {
            type: 'string',
          },
          fieldActor: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                enum: [
                  'EMAIL',
                  'CALENDAR',
                  'WORKFLOW',
                  'API',
                  'IMPORT',
                  'MANUAL',
                  'SYSTEM',
                  'WEBHOOK',
                ],
              },
            },
          },
        },
      },
      'ObjectName for Response': {
        description: undefined,
        type: 'object',
        properties: {
          fieldUuid: {
            type: 'string',
            format: 'uuid',
          },
          fieldText: {
            type: 'string',
          },
          fieldPhones: {
            properties: {
              additionalPhones: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              primaryPhoneCountryCode: {
                type: 'string',
              },
              primaryPhoneCallingCode: {
                type: 'string',
              },
              primaryPhoneNumber: {
                type: 'string',
              },
            },
            type: 'object',
          },
          fieldEmails: {
            type: 'object',
            properties: {
              primaryEmail: {
                type: 'string',
              },
              additionalEmails: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'email',
                },
              },
            },
          },
          fieldDateTime: {
            type: 'string',
            format: 'date-time',
          },
          fieldDate: {
            type: 'string',
            format: 'date',
          },
          fieldArray: {
            items: {
              type: 'string',
            },
            type: 'array',
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
          fieldLinks: {
            type: 'object',
            properties: {
              primaryLinkLabel: {
                type: 'string',
              },
              primaryLinkUrl: {
                type: 'string',
              },
              secondaryLinks: {
                type: 'array',
                items: {
                  type: 'object',
                  description: 'A secondary link',
                  properties: {
                    url: {
                      type: 'string',
                      format: 'uri',
                    },
                    label: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          fieldCurrency: {
            type: 'object',
            properties: {
              amountMicros: {
                type: 'number',
              },
              currencyCode: {
                type: 'string',
              },
            },
          },
          fieldFullName: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string',
              },
              lastName: {
                type: 'string',
              },
            },
          },
          fieldRating: {
            type: 'string',
            enum: ['RATING_1', 'RATING_2'],
          },
          fieldSelect: {
            type: 'string',
            enum: ['OPTION_1', 'OPTION_2'],
          },
          fieldMultiSelect: {
            type: 'array',
            items: { type: 'string', enum: ['OPTION_1', 'OPTION_2'] },
          },
          fieldPosition: {
            type: 'number',
          },
          fieldAddress: {
            type: 'object',
            properties: {
              addressStreet1: {
                type: 'string',
              },
              addressStreet2: {
                type: 'string',
              },
              addressCity: {
                type: 'string',
              },
              addressPostcode: {
                type: 'string',
              },
              addressState: {
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
            },
          },
          fieldRawJson: {
            type: 'object',
          },
          fieldRichText: {
            type: 'string',
          },
          fieldActor: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                enum: [
                  'EMAIL',
                  'CALENDAR',
                  'WORKFLOW',
                  'API',
                  'IMPORT',
                  'MANUAL',
                  'SYSTEM',
                  'WEBHOOK',
                ],
              },
              workspaceMemberId: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
            },
          },
          fieldRelation: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ToObjectMetadataName for Response',
            },
          },
        },
      },
    });
  });
});

describe('computeSchemaComponentsForDecimalFields', () => {
  it('should compute schema components', () => {
    expect(
      computeSchemaComponents([
        {
          targetTableName: 'testingObject',
          id: 'mockObjectId',
          nameSingular: 'objectName',
          namePlural: 'objectsName',
          fields: [
            {
              id: 'number1',
              name: 'number1',
              type: FieldMetadataType.NUMBER,
              isNullable: false,
              defaultValue: null,
              settings: { type: 'number', decimals: 1 },
            },
            {
              id: 'number2',
              name: 'number2',
              type: FieldMetadataType.NUMBER,
              isNullable: false,
              defaultValue: null,
              settings: { type: 'number', dataType: NumberDataType.FLOAT },
            },
          ] as FieldMetadataEntity<FieldMetadataType.NUMBER>[],
        },
      ] as ObjectMetadataEntity[]),
    ).toEqual({
      ObjectName: {
        description: undefined,
        type: 'object',
        properties: {
          number1: {
            type: 'number',
          },
          number2: {
            type: 'number',
          },
        },
        required: ['number1', 'number2'],
      },
      'ObjectName for Response': {
        description: undefined,
        properties: {
          number1: {
            type: 'number',
          },
          number2: {
            type: 'number',
          },
        },
        type: 'object',
      },
      'ObjectName for Update': {
        description: undefined,
        properties: {
          number1: {
            type: 'number',
          },
          number2: {
            type: 'number',
          },
        },
        type: 'object',
      },
    });
  });
});
