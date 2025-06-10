import { FieldMetadataType } from 'twenty-shared/types';
import { EachTestingContext } from 'twenty-shared/testing';

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
    ).toMatchInlineSnapshot(`
{
  "ObjectName": {
    "description": undefined,
    "properties": {
      "fieldActor": {
        "properties": {
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
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
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "type": "boolean",
      },
      "fieldCurrency": {
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
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
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
        "type": "integer",
      },
      "fieldNumeric": {
        "type": "number",
      },
      "fieldPhones": {
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
        "type": "number",
      },
      "fieldRating": {
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "type": "object",
      },
      "fieldRichText": {
        "type": "string",
      },
      "fieldSelect": {
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "type": "string",
      },
      "fieldUuid": {
        "format": "uuid",
        "type": "string",
      },
    },
    "required": [
      "fieldNumber",
    ],
    "type": "object",
  },
  "ObjectName for Response": {
    "description": undefined,
    "properties": {
      "fieldActor": {
        "properties": {
          "name": {
            "type": "string",
          },
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
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
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "type": "boolean",
      },
      "fieldCurrency": {
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
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
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
        "type": "integer",
      },
      "fieldNumeric": {
        "type": "number",
      },
      "fieldPhones": {
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
        "type": "number",
      },
      "fieldRating": {
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "type": "object",
      },
      "fieldRelation": {
        "items": {
          "$ref": "#/components/schemas/ToObjectMetadataName for Response",
        },
        "type": "array",
      },
      "fieldRichText": {
        "type": "string",
      },
      "fieldSelect": {
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "type": "string",
      },
      "fieldUuid": {
        "format": "uuid",
        "type": "string",
      },
    },
    "type": "object",
  },
  "ObjectName for Update": {
    "description": undefined,
    "properties": {
      "fieldActor": {
        "properties": {
          "source": {
            "enum": [
              "EMAIL",
              "CALENDAR",
              "WORKFLOW",
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
        "items": {
          "type": "string",
        },
        "type": "array",
      },
      "fieldBoolean": {
        "type": "boolean",
      },
      "fieldCurrency": {
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
        "format": "date",
        "type": "string",
      },
      "fieldDateTime": {
        "format": "date-time",
        "type": "string",
      },
      "fieldEmails": {
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
        "type": "integer",
      },
      "fieldNumeric": {
        "type": "number",
      },
      "fieldPhones": {
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
        "type": "number",
      },
      "fieldRating": {
        "enum": [
          "RATING_1",
          "RATING_2",
        ],
        "type": "string",
      },
      "fieldRawJson": {
        "type": "object",
      },
      "fieldRichText": {
        "type": "string",
      },
      "fieldSelect": {
        "enum": [
          "OPTION_1",
          "OPTION_2",
        ],
        "type": "string",
      },
      "fieldText": {
        "type": "string",
      },
      "fieldUuid": {
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
    expect(
      computeSchemaComponents([
        {
          targetTableName: 'testingObject',
          id: 'mockObjectId',
          nameSingular: 'objectName',
          namePlural: 'objectsName',
          //@ts-expect-error Passing partial FieldMetadataEntity array
          fields: [field],
        },
      ]),
    ).toMatchSnapshot();
  });
});
