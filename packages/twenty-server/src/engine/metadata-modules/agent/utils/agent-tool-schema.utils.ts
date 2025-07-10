import { jsonSchema } from 'ai';
import { JSONSchema7Definition } from 'json-schema';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { convertObjectMetadataToSchemaProperties } from 'src/engine/utils/convert-object-metadata-to-schema-properties.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const createToolSchema = (
  inputProperties: Record<string, JSONSchema7Definition>,
  required?: string[],
) => {
  return jsonSchema({
    type: 'object',
    properties: {
      toolDescription: {
        type: 'string',
        description:
          'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
      },
      input: {
        type: 'object',
        properties: inputProperties,
        ...(required && { required }),
      },
    },
  });
};

export const getRecordInputSchema = (objectMetadata: ObjectMetadataEntity) => {
  return createToolSchema(
    convertObjectMetadataToSchemaProperties({
      item: objectMetadata,
      forResponse: false,
    }),
  );
};

export const generateFindToolSchema = (
  objectMetadata: ObjectMetadataEntity,
) => {
  const schemaProperties: Record<string, JSONSchema7Definition> = {
    limit: {
      type: 'number',
      description: 'Maximum number of records to return (default: 100)',
      default: 100,
    },
    offset: {
      type: 'number',
      description: 'Number of records to skip (default: 0)',
      default: 0,
    },
  };

  objectMetadata.fields.forEach((field: FieldMetadataEntity) => {
    if (shouldExcludeFieldFromAgentToolSchema(field)) {
      return;
    }

    const filterSchema = generateFieldFilterJsonSchema(field);

    if (filterSchema) {
      schemaProperties[field.name] = filterSchema;
    }
  });

  return createToolSchema(schemaProperties);
};

const generateFieldFilterJsonSchema = (
  field: FieldMetadataEntity,
): JSONSchema7Definition | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return {
        type: 'object',
        description: `Filter by ${field.name} (UUID field)`,
        properties: {
          eq: {
            type: 'string',
            format: 'uuid',
            description: 'Equals',
          },
          neq: {
            type: 'string',
            format: 'uuid',
            description: 'Not equals',
          },
          in: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid',
            },
            description: 'In array of values',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2:
      return {
        type: 'object',
        description: `Filter by ${field.name} (text field)`,
        properties: {
          eq: {
            type: 'string',
            description: 'Equals',
          },
          neq: {
            type: 'string',
            description: 'Not equals',
          },
          in: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'In array of values',
          },
          like: {
            type: 'string',
            description: 'Case-sensitive pattern match (use % for wildcards)',
          },
          ilike: {
            type: 'string',
            description: 'Case-insensitive pattern match (use % for wildcards)',
          },
          startsWith: {
            type: 'string',
            description: 'Starts with',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return {
        type: 'object',
        description: `Filter by ${field.name} (number field)`,
        properties: {
          eq: {
            type: 'number',
            description: 'Equals',
          },
          neq: {
            type: 'number',
            description: 'Not equals',
          },
          gt: {
            type: 'number',
            description: 'Greater than',
          },
          gte: {
            type: 'number',
            description: 'Greater than or equal',
          },
          lt: {
            type: 'number',
            description: 'Less than',
          },
          lte: {
            type: 'number',
            description: 'Less than or equal',
          },
          in: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'In array of values',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };

    case FieldMetadataType.BOOLEAN:
      return {
        type: 'object',
        description: `Filter by ${field.name} (boolean field)`,
        properties: {
          eq: {
            type: 'boolean',
            description: 'Equals',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return {
        type: 'object',
        description: `Filter by ${field.name} (date field)`,
        properties: {
          eq: {
            type: 'string',
            format: 'date-time',
            description: 'Equals (ISO datetime string)',
          },
          neq: {
            type: 'string',
            format: 'date-time',
            description: 'Not equals (ISO datetime string)',
          },
          gt: {
            type: 'string',
            format: 'date-time',
            description: 'Greater than (ISO datetime string)',
          },
          gte: {
            type: 'string',
            format: 'date-time',
            description: 'Greater than or equal (ISO datetime string)',
          },
          lt: {
            type: 'string',
            format: 'date-time',
            description: 'Less than (ISO datetime string)',
          },
          lte: {
            type: 'string',
            format: 'date-time',
            description: 'Less than or equal (ISO datetime string)',
          },
          in: {
            type: 'array',
            items: {
              type: 'string',
              format: 'date-time',
            },
            description: 'In array of values (ISO datetime strings)',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };

    case FieldMetadataType.SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return {
        type: 'object',
        description: `Filter by ${field.name} (select field)`,
        properties: {
          eq: {
            type: 'string',
            enum: enumValues,
            description: 'Equals',
          },
          neq: {
            type: 'string',
            enum: enumValues,
            description: 'Not equals',
          },
          in: {
            type: 'array',
            items: {
              type: 'string',
              enum: enumValues,
            },
            description: 'In array of values',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };
    }

    case FieldMetadataType.MULTI_SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return {
        type: 'object',
        description: `Filter by ${field.name} (multi-select field)`,
        properties: {
          in: {
            type: 'array',
            items: {
              type: 'string',
              enum: enumValues,
            },
            description: 'Contains any of these values',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
          isEmptyArray: {
            type: 'boolean',
            description: 'Is empty array',
          },
        },
      };
    }

    case FieldMetadataType.RATING: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return {
        type: 'object',
        description: `Filter by ${field.name} (rating field)`,
        properties: {
          eq: {
            type: 'string',
            enum: enumValues,
            description: 'Equals',
          },
          in: {
            type: 'array',
            items: {
              type: 'string',
              enum: enumValues,
            },
            description: 'In array of values',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };
    }

    case FieldMetadataType.ARRAY:
      return {
        type: 'object',
        description: `Filter by ${field.name} (array field)`,
        properties: {
          containsIlike: {
            type: 'string',
            description: 'Contains case-insensitive substring',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
          isEmptyArray: {
            type: 'boolean',
            description: 'Is empty array',
          },
        },
      };

    case FieldMetadataType.CURRENCY:
      return {
        type: 'object',
        description: `Filter by ${field.name} (currency field)`,
        properties: {
          amountMicros: {
            type: 'object',
            description: 'Filter by amount',
            properties: {
              eq: {
                type: 'number',
                description: 'Amount equals',
              },
              neq: {
                type: 'number',
                description: 'Amount not equals',
              },
              gt: {
                type: 'number',
                description: 'Amount greater than',
              },
              gte: {
                type: 'number',
                description: 'Amount greater than or equal',
              },
              lt: {
                type: 'number',
                description: 'Amount less than',
              },
              lte: {
                type: 'number',
                description: 'Amount less than or equal',
              },
              in: {
                type: 'array',
                items: {
                  type: 'number',
                },
                description: 'Amount in array of values',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Amount is null or not null',
              },
            },
          },
          currencyCode: {
            type: 'object',
            description: 'Filter by currency code',
            properties: {
              eq: {
                type: 'string',
                description: 'Currency code equals',
              },
              neq: {
                type: 'string',
                description: 'Currency code not equals',
              },
              in: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Currency code in array of values',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Currency code is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.FULL_NAME:
      return {
        type: 'object',
        description: `Filter by ${field.name} (full name field)`,
        properties: {
          firstName: {
            type: 'object',
            description: 'Filter by first name',
            properties: {
              eq: {
                type: 'string',
                description: 'First name equals',
              },
              neq: {
                type: 'string',
                description: 'First name not equals',
              },
              like: {
                type: 'string',
                description: 'First name case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'First name case-insensitive pattern match',
              },
              startsWith: {
                type: 'string',
                description: 'First name starts with',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'First name is null or not null',
              },
            },
          },
          lastName: {
            type: 'object',
            description: 'Filter by last name',
            properties: {
              eq: {
                type: 'string',
                description: 'Last name equals',
              },
              neq: {
                type: 'string',
                description: 'Last name not equals',
              },
              like: {
                type: 'string',
                description: 'Last name case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'Last name case-insensitive pattern match',
              },
              startsWith: {
                type: 'string',
                description: 'Last name starts with',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Last name is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.ADDRESS:
      return {
        type: 'object',
        description: `Filter by ${field.name} (address field)`,
        properties: {
          addressStreet1: {
            type: 'object',
            description: 'Filter by street 1',
            properties: {
              eq: {
                type: 'string',
                description: 'Street 1 equals',
              },
              neq: {
                type: 'string',
                description: 'Street 1 not equals',
              },
              like: {
                type: 'string',
                description: 'Street 1 case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'Street 1 case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Street 1 is null or not null',
              },
            },
          },
          addressCity: {
            type: 'object',
            description: 'Filter by city',
            properties: {
              eq: {
                type: 'string',
                description: 'City equals',
              },
              neq: {
                type: 'string',
                description: 'City not equals',
              },
              like: {
                type: 'string',
                description: 'City case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'City case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'City is null or not null',
              },
            },
          },
          addressCountry: {
            type: 'object',
            description: 'Filter by country',
            properties: {
              eq: {
                type: 'string',
                description: 'Country equals',
              },
              neq: {
                type: 'string',
                description: 'Country not equals',
              },
              like: {
                type: 'string',
                description: 'Country case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'Country case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Country is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.EMAILS:
      return {
        type: 'object',
        description: `Filter by ${field.name} (emails field)`,
        properties: {
          primaryEmail: {
            type: 'object',
            description: 'Filter by primary email',
            properties: {
              eq: {
                type: 'string',
                format: 'email',
                description: 'Primary email equals',
              },
              neq: {
                type: 'string',
                format: 'email',
                description: 'Primary email not equals',
              },
              like: {
                type: 'string',
                description: 'Primary email case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'Primary email case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Primary email is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.PHONES:
      return {
        type: 'object',
        description: `Filter by ${field.name} (phones field)`,
        properties: {
          primaryPhoneNumber: {
            type: 'object',
            description: 'Filter by primary phone number',
            properties: {
              eq: {
                type: 'string',
                description: 'Primary phone number equals',
              },
              neq: {
                type: 'string',
                description: 'Primary phone number not equals',
              },
              like: {
                type: 'string',
                description:
                  'Primary phone number case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description:
                  'Primary phone number case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Primary phone number is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.LINKS:
      return {
        type: 'object',
        description: `Filter by ${field.name} (links field)`,
        properties: {
          primaryLinkUrl: {
            type: 'object',
            description: 'Filter by primary link URL',
            properties: {
              eq: {
                type: 'string',
                format: 'uri',
                description: 'Primary link URL equals',
              },
              neq: {
                type: 'string',
                format: 'uri',
                description: 'Primary link URL not equals',
              },
              like: {
                type: 'string',
                description: 'Primary link URL case-sensitive pattern match',
              },
              ilike: {
                type: 'string',
                description: 'Primary link URL case-insensitive pattern match',
              },
              is: {
                type: 'string',
                enum: ['NULL', 'NOT_NULL'],
                description: 'Primary link URL is null or not null',
              },
            },
          },
        },
      };

    case FieldMetadataType.RELATION:
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        return {
          type: 'object',
          description: `Filter by ${fieldName} (relation field)`,
          properties: {
            eq: {
              type: 'string',
              format: 'uuid',
              description: 'Related record ID equals',
            },
            neq: {
              type: 'string',
              format: 'uuid',
              description: 'Related record ID not equals',
            },
            in: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Related record ID in array of values',
            },
            is: {
              type: 'string',
              enum: ['NULL', 'NOT_NULL'],
              description: 'Related record ID is null or not null',
            },
          },
        };
      }

      return null;

    case FieldMetadataType.RAW_JSON:
      return {
        type: 'object',
        description: `Filter by ${field.name} (raw JSON field)`,
        properties: {
          eq: {
            type: 'string',
            description: 'Raw JSON equals',
          },
          neq: {
            type: 'string',
            description: 'Raw JSON not equals',
          },
          like: {
            type: 'string',
            description: 'Raw JSON case-sensitive pattern match',
          },
          ilike: {
            type: 'string',
            description: 'Raw JSON case-insensitive pattern match',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Raw JSON is null or not null',
          },
        },
      };

    default:
      return {
        type: 'object',
        description: `Filter by ${field.name} (string field)`,
        properties: {
          eq: {
            type: 'string',
            description: 'Equals',
          },
          neq: {
            type: 'string',
            description: 'Not equals',
          },
          like: {
            type: 'string',
            description: 'Case-sensitive pattern match',
          },
          ilike: {
            type: 'string',
            description: 'Case-insensitive pattern match',
          },
          is: {
            type: 'string',
            enum: ['NULL', 'NOT_NULL'],
            description: 'Is null or not null',
          },
        },
      };
  }
};

export const generateBulkDeleteToolSchema = () => {
  return createToolSchema({
    filter: {
      type: 'object',
      description: 'Filter criteria to select records for bulk delete',
      properties: {
        id: {
          type: 'object',
          description: 'Filter to select records to delete',
          properties: {
            in: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Array of record IDs to delete',
            },
          },
        },
      },
    },
  });
};

export const generateFindOneToolSchema = () => {
  return createToolSchema(
    {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'The unique UUID of the record to retrieve',
      },
    },
    ['id'],
  );
};

export const generateSoftDeleteToolSchema = () => {
  return createToolSchema(
    {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'The unique UUID of the record to soft delete',
      },
    },
    ['id'],
  );
};
