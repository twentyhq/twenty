import { faker } from '@faker-js/faker';
import { type EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { computeSchemaComponents } from 'src/engine/core-modules/open-api/utils/components.utils';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('computeSchemaComponents', () => {
  faker.seed(1);
  it('should compute schema components', () => {
    const flatObjectMetadata: FlatObjectMetadata = {
      ...objectMetadataItemMock,
      universalIdentifier: 'objectName',
      fieldMetadataIds: objectMetadataItemMock.fields.map((f) => f.id),
    } as any;

    const flatFieldMetadataMaps = {
      byId: Object.fromEntries(
        objectMetadataItemMock.fields.map((f) => [f.id, f as any]),
      ),
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    const relationTargetObjectMetadata: FlatObjectMetadata = {
      id: 'relationTargetObjectId',
      nameSingular: 'relationTargetObject',
      namePlural: 'relationTargetObjects',
      universalIdentifier: 'relationTargetObject',
      fieldMetadataIds: [],
    } as any;

    const flatObjectMetadataMaps = {
      byId: {
        [flatObjectMetadata.id]: flatObjectMetadata,
        [relationTargetObjectMetadata.id]: relationTargetObjectMetadata,
      },
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    expect(
      computeSchemaComponents(
        [flatObjectMetadata],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ),
    ).toMatchInlineSnapshot(`
{
  "ObjectName": {
    "description": "Object description",
    "example": {
      "fieldCurrency": {
        "amountMicros": 284000000,
        "currencyCode": "EUR",
      },
      "fieldEmails": {
        "additionalEmails": null,
        "primaryEmail": "mina.gutmann9@hotmail.com",
      },
      "fieldFullName": {
        "firstName": "Shad",
        "lastName": "Osinski",
      },
      "fieldLinks": {
        "primaryLinkLabel": "",
        "primaryLinkUrl": "https://narrow-help.net/",
        "secondaryLinks": [],
      },
      "fieldMultiSelect": [
        "OPTION_1",
      ],
      "fieldNumber": 346.2151663160047,
      "fieldPhones": {
        "additionalPhones": [],
        "primaryPhoneCallingCode": "+33",
        "primaryPhoneCountryCode": "FR",
        "primaryPhoneNumber": "06 10 20 30 40",
      },
      "fieldSelect": "OPTION_1",
    },
    "properties": {
      "fieldActor": {
        "description": "Default field metadata entity description",
        "properties": {
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
              "AGENT",
              "API",
              "IMPORT",
              "MANUAL",
              "SYSTEM",
              "WEBHOOK",
            ],
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldAddress": {
        "description": "Default field metadata entity description",
        "properties": {
          "addressCity": {
            "type": "string",
          },
          "addressCountry": {
            "type": "string",
          },
          "addressLat": {
            "type": "number",
          },
          "addressLng": {
            "type": "number",
          },
          "addressPostcode": {
            "type": "string",
          },
          "addressState": {
            "type": "string",
          },
          "addressStreet1": {
            "type": "string",
          },
          "addressStreet2": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldArray": {
        "description": "Default field metadata entity description",
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "description": "Default field metadata entity description",
        "type": "boolean",
      },
      "fieldCurrency": {
        "description": "Default field metadata entity description",
        "properties": {
          "amountMicros": {
            "type": "number",
          },
          "currencyCode": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldDate": {
        "description": "Default field metadata entity description",
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "description": "Default field metadata entity description",
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalEmails": {
            "items": {
              "format": "email",
              "type": "string",
            },
            "type": "array",
          },
          "primaryEmail": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldFullName": {
        "description": "Default field metadata entity description",
        "properties": {
          "firstName": {
            "type": "string",
          },
          "lastName": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldLinks": {
        "description": "Default field metadata entity description",
        "properties": {
          "primaryLinkLabel": {
            "type": "string",
          },
          "primaryLinkUrl": {
            "type": "string",
          },
          "secondaryLinks": {
            "items": {
              "description": "A secondary link",
              "properties": {
                "label": {
                  "type": "string",
                },
                "url": {
                  "format": "uri",
                  "type": "string",
                },
              },
              "type": "object",
            },
            "type": "array",
          },
        },
        "type": "object",
      },
      "fieldMultiSelect": {
        "description": "Default field metadata entity description",
        "items": {
          "enum": [
            "OPTION_1",
            "OPTION_2",
          ],
          "type": "string",
        },
        "type": "array",
      },
      "fieldNumber": {
        "description": "Default field metadata entity description",
        "type": "integer",
      },
      "fieldNumeric": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldPhones": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalPhones": {
            "items": {
              "type": "string",
            },
            "type": "array",
          },
          "primaryPhoneCallingCode": {
            "type": "string",
          },
          "primaryPhoneCountryCode": {
            "type": "string",
          },
          "primaryPhoneNumber": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldPosition": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldRating": {
        "description": "Default field metadata entity description",
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "description": "Default field metadata entity description",
        "type": "object",
      },
      "fieldRelationId": {
        "format": "uuid",
        "type": "string",
      },
      "fieldRichText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldSelect": {
        "description": "Default field metadata entity description",
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldUuid": {
        "description": "Default field metadata entity description",
        "format": "uuid",
        "type": "string",
      },
    },
    "required": [
      "fieldNumber",
    ],
    "type": "object",
  },
  "ObjectNameForResponse": {
    "description": "Object description",
    "properties": {
      "fieldActor": {
        "description": "Default field metadata entity description",
        "properties": {
          "name": {
            "type": "string",
          },
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
              "AGENT",
              "API",
              "IMPORT",
              "MANUAL",
              "SYSTEM",
              "WEBHOOK",
            ],
            "type": "string",
          },
          "workspaceMemberId": {
            "format": "uuid",
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldAddress": {
        "description": "Default field metadata entity description",
        "properties": {
          "addressCity": {
            "type": "string",
          },
          "addressCountry": {
            "type": "string",
          },
          "addressLat": {
            "type": "number",
          },
          "addressLng": {
            "type": "number",
          },
          "addressPostcode": {
            "type": "string",
          },
          "addressState": {
            "type": "string",
          },
          "addressStreet1": {
            "type": "string",
          },
          "addressStreet2": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldArray": {
        "description": "Default field metadata entity description",
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "description": "Default field metadata entity description",
        "type": "boolean",
      },
      "fieldCurrency": {
        "description": "Default field metadata entity description",
        "properties": {
          "amountMicros": {
            "type": "number",
          },
          "currencyCode": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldDate": {
        "description": "Default field metadata entity description",
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "description": "Default field metadata entity description",
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalEmails": {
            "items": {
              "format": "email",
              "type": "string",
            },
            "type": "array",
          },
          "primaryEmail": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldFullName": {
        "description": "Default field metadata entity description",
        "properties": {
          "firstName": {
            "type": "string",
          },
          "lastName": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldLinks": {
        "description": "Default field metadata entity description",
        "properties": {
          "primaryLinkLabel": {
            "type": "string",
          },
          "primaryLinkUrl": {
            "type": "string",
          },
          "secondaryLinks": {
            "items": {
              "description": "A secondary link",
              "properties": {
                "label": {
                  "type": "string",
                },
                "url": {
                  "format": "uri",
                  "type": "string",
                },
              },
              "type": "object",
            },
            "type": "array",
          },
        },
        "type": "object",
      },
      "fieldMultiSelect": {
        "description": "Default field metadata entity description",
        "items": {
          "enum": [
            "OPTION_1",
            "OPTION_2",
          ],
          "type": "string",
        },
        "type": "array",
      },
      "fieldNumber": {
        "description": "Default field metadata entity description",
        "type": "integer",
      },
      "fieldNumeric": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldPhones": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalPhones": {
            "items": {
              "type": "string",
            },
            "type": "array",
          },
          "primaryPhoneCallingCode": {
            "type": "string",
          },
          "primaryPhoneCountryCode": {
            "type": "string",
          },
          "primaryPhoneNumber": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldPosition": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldRating": {
        "description": "Default field metadata entity description",
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "description": "Default field metadata entity description",
        "type": "object",
      },
      "fieldRelation": {
        "description": "Default field metadata entity description",
        "oneOf": [
          {
            "$ref": "#/components/schemas/RelationTargetObjectForResponse",
          },
        ],
        "type": "object",
      },
      "fieldRelationId": {
        "format": "uuid",
        "type": "string",
      },
      "fieldRichText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldSelect": {
        "description": "Default field metadata entity description",
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldUuid": {
        "description": "Default field metadata entity description",
        "format": "uuid",
        "type": "string",
      },
    },
    "type": "object",
  },
  "ObjectNameForUpdate": {
    "description": "Object description",
    "example": {
      "fieldCurrency": {
        "amountMicros": 253000000,
        "currencyCode": "EUR",
      },
      "fieldEmails": {
        "additionalEmails": null,
        "primaryEmail": "keegan_donnelly96@hotmail.com",
      },
      "fieldFullName": {
        "firstName": "Shad",
        "lastName": "Jones",
      },
      "fieldLinks": {
        "primaryLinkLabel": "",
        "primaryLinkUrl": "https://unlawful-blowgun.biz",
        "secondaryLinks": [],
      },
      "fieldMultiSelect": [
        "OPTION_1",
      ],
      "fieldNumber": 692.6302930536448,
      "fieldPhones": {
        "additionalPhones": [],
        "primaryPhoneCallingCode": "+33",
        "primaryPhoneCountryCode": "FR",
        "primaryPhoneNumber": "06 10 20 30 40",
      },
      "fieldSelect": "OPTION_1",
    },
    "properties": {
      "fieldActor": {
        "description": "Default field metadata entity description",
        "properties": {
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
              "AGENT",
              "API",
              "IMPORT",
              "MANUAL",
              "SYSTEM",
              "WEBHOOK",
            ],
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldAddress": {
        "description": "Default field metadata entity description",
        "properties": {
          "addressCity": {
            "type": "string",
          },
          "addressCountry": {
            "type": "string",
          },
          "addressLat": {
            "type": "number",
          },
          "addressLng": {
            "type": "number",
          },
          "addressPostcode": {
            "type": "string",
          },
          "addressState": {
            "type": "string",
          },
          "addressStreet1": {
            "type": "string",
          },
          "addressStreet2": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldArray": {
        "description": "Default field metadata entity description",
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "description": "Default field metadata entity description",
        "type": "boolean",
      },
      "fieldCurrency": {
        "description": "Default field metadata entity description",
        "properties": {
          "amountMicros": {
            "type": "number",
          },
          "currencyCode": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldDate": {
        "description": "Default field metadata entity description",
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "description": "Default field metadata entity description",
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalEmails": {
            "items": {
              "format": "email",
              "type": "string",
            },
            "type": "array",
          },
          "primaryEmail": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldFullName": {
        "description": "Default field metadata entity description",
        "properties": {
          "firstName": {
            "type": "string",
          },
          "lastName": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldLinks": {
        "description": "Default field metadata entity description",
        "properties": {
          "primaryLinkLabel": {
            "type": "string",
          },
          "primaryLinkUrl": {
            "type": "string",
          },
          "secondaryLinks": {
            "items": {
              "description": "A secondary link",
              "properties": {
                "label": {
                  "type": "string",
                },
                "url": {
                  "format": "uri",
                  "type": "string",
                },
              },
              "type": "object",
            },
            "type": "array",
          },
        },
        "type": "object",
      },
      "fieldMultiSelect": {
        "description": "Default field metadata entity description",
        "items": {
          "enum": [
            "OPTION_1",
            "OPTION_2",
          ],
          "type": "string",
        },
        "type": "array",
      },
      "fieldNumber": {
        "description": "Default field metadata entity description",
        "type": "integer",
      },
      "fieldNumeric": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldPhones": {
        "description": "Default field metadata entity description",
        "properties": {
          "additionalPhones": {
            "items": {
              "type": "string",
            },
            "type": "array",
          },
          "primaryPhoneCallingCode": {
            "type": "string",
          },
          "primaryPhoneCountryCode": {
            "type": "string",
          },
          "primaryPhoneNumber": {
            "type": "string",
          },
        },
        "type": "object",
      },
      "fieldPosition": {
        "description": "Default field metadata entity description",
        "type": "number",
      },
      "fieldRating": {
        "description": "Default field metadata entity description",
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "description": "Default field metadata entity description",
        "type": "object",
      },
      "fieldRelationId": {
        "format": "uuid",
        "type": "string",
      },
      "fieldRichText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldSelect": {
        "description": "Default field metadata entity description",
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "description": "Default field metadata entity description",
        "type": "string",
      },
      "fieldUuid": {
        "description": "Default field metadata entity description",
        "format": "uuid",
        "type": "string",
      },
    },
    "type": "object",
  },
}
`);
  });

  const testsCases: EachTestingContext<
    Pick<
      FieldMetadataEntity<FieldMetadataType.NUMBER>,
      'id' | 'name' | 'type' | 'isNullable' | 'defaultValue' | 'settings'
    >
  >[] = [
    {
      title: 'Integer dataType with decimals',
      context: {
        id: 'number1',
        name: 'number1',
        type: FieldMetadataType.NUMBER,
        isNullable: false,
        defaultValue: null,
        settings: { type: 'number', decimals: 1, dataType: NumberDataType.INT },
      },
    },
    {
      title: 'Float without decimals',
      context: {
        id: 'number2',
        name: 'number2',
        type: FieldMetadataType.NUMBER,
        isNullable: false,
        defaultValue: null,
        settings: { type: 'number', dataType: NumberDataType.FLOAT },
      },
    },
    {
      title: 'Integer with a 0 decimals',
      context: {
        id: 'number3',
        name: 'number3',
        type: FieldMetadataType.NUMBER,
        isNullable: false,
        defaultValue: null,
        settings: { type: 'number', decimals: 0, dataType: NumberDataType.INT },
      },
    },
  ];

  it.each(testsCases)('$title', ({ context: field }) => {
    const flatObjectMetadata: FlatObjectMetadata = {
      targetTableName: 'testingObject',
      id: 'mockObjectId',
      nameSingular: 'objectName',
      namePlural: 'objectsName',
      universalIdentifier: 'objectName',
      fieldMetadataIds: [field.id],
    } as any;

    const flatFieldMetadataMaps = {
      byId: {
        [field.id]: field as any,
      },
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    const flatObjectMetadataMaps = {
      byId: {
        [flatObjectMetadata.id]: flatObjectMetadata,
      },
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    };

    expect(
      computeSchemaComponents(
        [flatObjectMetadata],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ),
    ).toMatchSnapshot();
  });
});
