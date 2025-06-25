import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type AgentToolParameter = {
  type: string;
  description?: string;
  format?: string;
  enum?: string[];
  items?: AgentToolParameter;
  properties?: Record<string, AgentToolParameter>;
};

type AgentToolParameters = Record<string, AgentToolParameter>;

export const generateAgentToolParameters = (
  objectMetadata: ObjectMetadataEntity,
): AgentToolParameters => {
  const parameters: AgentToolParameters = {};

  objectMetadata.fields.forEach((field) => {
    if (
      field.name === 'id' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        parameters[fieldName] = {
          type: 'string',
          format: 'uuid',
          description: field.description || `ID of the related ${field.name}`,
        };
      }

      return;
    }

    const parameter = convertFieldToAgentToolParameter(field);

    if (parameter) {
      parameters[field.name] = parameter;
    }
  });

  return parameters;
};

export const generateAgentToolZodSchema = (
  objectMetadata: ObjectMetadataEntity,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (
      field.name === 'id' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        schemaFields[fieldName] = z
          .string()
          .uuid()
          .nullable()
          .describe(field.description || `ID of the related ${field.name}`);
      }

      return;
    }

    const zodField = convertFieldToZodField(field);

    if (zodField) {
      schemaFields[field.name] = zodField;
    }
  });

  return z.object(schemaFields);
};

export const generateAgentToolUpdateZodSchema = (
  objectMetadata: ObjectMetadataEntity,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    // Include id field for update operations - this is required
    id: z.string().uuid().describe('The ID of the record to update'),
  };

  objectMetadata.fields.forEach((field) => {
    if (
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        schemaFields[fieldName] = z
          .string()
          .uuid()
          .nullable()
          .optional()
          .describe(field.description || `ID of the related ${field.name}`);
      }

      return;
    }

    const zodField = convertFieldToZodFieldForUpdate(field);

    if (zodField) {
      schemaFields[field.name] = zodField;
    }
  });

  return z.object(schemaFields);
};

const convertFieldToZodField = (
  field: FieldMetadataEntity,
): z.ZodTypeAny | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return (
        field.isNullable ? z.string().uuid().nullable() : z.string().uuid()
      ).describe(field.description || 'UUID field');

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Text field',
      );

    case FieldMetadataType.DATE_TIME:
      return (
        field.isNullable
          ? z.string().datetime().nullable()
          : z.string().datetime()
      ).describe(field.description || 'Date and time field');

    case FieldMetadataType.DATE:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Date field (YYYY-MM-DD format)',
      );

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return (field.isNullable ? z.number().nullable() : z.number()).describe(
        field.description || 'Number field',
      );

    case FieldMetadataType.BOOLEAN:
      return (field.isNullable ? z.boolean().nullable() : z.boolean()).describe(
        field.description || 'Boolean field',
      );

    case FieldMetadataType.SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return (
        field.isNullable
          ? z.enum(enumValues as [string, ...string[]]).nullable()
          : z.enum(enumValues as [string, ...string[]])
      ).describe(field.description || 'Selection field');
    }

    case FieldMetadataType.MULTI_SELECT: {
      const multiEnumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return (
        field.isNullable
          ? z.array(z.enum(multiEnumValues as [string, ...string[]])).nullable()
          : z.array(z.enum(multiEnumValues as [string, ...string[]]))
      ).describe(field.description || 'Multi-selection field');
    }

    case FieldMetadataType.ARRAY:
      return (
        field.isNullable ? z.array(z.string()).nullable() : z.array(z.string())
      ).describe(field.description || 'Array of strings');

    case FieldMetadataType.LINKS:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Links field (JSON string format)',
      );

    case FieldMetadataType.CURRENCY:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Currency field',
      );

    case FieldMetadataType.FULL_NAME:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Full name field',
      );

    case FieldMetadataType.ADDRESS:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Address field (JSON string format)',
      );

    case FieldMetadataType.EMAILS:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Emails field (JSON string format)',
      );

    case FieldMetadataType.PHONES:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Phones field (JSON string format)',
      );

    case FieldMetadataType.RAW_JSON:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'Raw JSON field',
      );

    default:
      return (field.isNullable ? z.string().nullable() : z.string()).describe(
        field.description || 'String field',
      );
  }
};

const convertFieldToZodFieldForUpdate = (
  field: FieldMetadataEntity,
): z.ZodTypeAny | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return z
        .string()
        .uuid()
        .nullable()
        .optional()
        .describe(field.description || 'UUID field');

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Text field');

    case FieldMetadataType.DATE_TIME:
      return z
        .string()
        .datetime()
        .nullable()
        .optional()
        .describe(field.description || 'Date and time field');

    case FieldMetadataType.DATE:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Date field (YYYY-MM-DD format)');

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return z
        .number()
        .nullable()
        .optional()
        .describe(field.description || 'Number field');

    case FieldMetadataType.BOOLEAN:
      return z
        .boolean()
        .nullable()
        .optional()
        .describe(field.description || 'Boolean field');

    case FieldMetadataType.SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return z
        .enum(enumValues as [string, ...string[]])
        .nullable()
        .optional()
        .describe(field.description || 'Selection field');
    }

    case FieldMetadataType.MULTI_SELECT: {
      const multiEnumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return z
        .array(z.enum(multiEnumValues as [string, ...string[]]))
        .nullable()
        .optional()
        .describe(field.description || 'Multi-selection field');
    }

    case FieldMetadataType.ARRAY:
      return z
        .array(z.string())
        .nullable()
        .optional()
        .describe(field.description || 'Array of strings');

    case FieldMetadataType.LINKS:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Links field (JSON string format)');

    case FieldMetadataType.CURRENCY:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Currency field');

    case FieldMetadataType.FULL_NAME:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Full name field');

    case FieldMetadataType.ADDRESS:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Address field (JSON string format)');

    case FieldMetadataType.EMAILS:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Emails field (JSON string format)');

    case FieldMetadataType.PHONES:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Phones field (JSON string format)');

    case FieldMetadataType.RAW_JSON:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'Raw JSON field');

    default:
      return z
        .string()
        .nullable()
        .optional()
        .describe(field.description || 'String field');
  }
};

/**
 * Converts a field metadata to an AI tool parameter
 */
const convertFieldToAgentToolParameter = (
  field: FieldMetadataEntity,
): AgentToolParameter | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return {
        type: 'string',
        format: 'uuid',
        description: field.description,
      };

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
      return {
        type: 'string',
        description: field.description,
      };

    case FieldMetadataType.DATE_TIME:
      return {
        type: 'string',
        format: 'date-time',
        description: field.description,
      };

    case FieldMetadataType.DATE:
      return {
        type: 'string',
        format: 'date',
        description: field.description,
      };

    case FieldMetadataType.NUMBER:
      return {
        type: 'number',
        description: field.description,
      };

    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return {
        type: 'number',
        description: field.description,
      };

    case FieldMetadataType.BOOLEAN:
      return {
        type: 'boolean',
        description: field.description,
      };

    case FieldMetadataType.SELECT:
      return {
        type: 'string',
        enum: field.options?.map((option: { value: string }) => option.value),
        description: field.description,
      };

    case FieldMetadataType.MULTI_SELECT:
      return {
        type: 'array',
        items: {
          type: 'string',
          enum: field.options?.map((option: { value: string }) => option.value),
        },
        description: field.description,
      };

    case FieldMetadataType.ARRAY:
      return {
        type: 'array',
        items: {
          type: 'string',
        },
        description: field.description,
      };

    case FieldMetadataType.LINKS:
      return {
        type: 'object',
        description: field.description,
        properties: {
          primaryLinkLabel: {
            type: 'string',
            description: 'Primary link label',
          },
          primaryLinkUrl: {
            type: 'string',
            description: 'Primary link URL',
          },
          secondaryLinks: {
            type: 'array',
            description: 'Secondary links',
            items: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  format: 'uri',
                  description: 'Link URL',
                },
                label: {
                  type: 'string',
                  description: 'Link label',
                },
              },
            },
          },
        },
      };

    case FieldMetadataType.CURRENCY:
      return {
        type: 'object',
        description: field.description,
        properties: {
          amountMicros: {
            type: 'number',
            description: 'Amount in micros (millionths)',
          },
          currencyCode: {
            type: 'string',
            description: 'Currency code (e.g., USD, EUR)',
          },
        },
      };

    case FieldMetadataType.FULL_NAME:
      return {
        type: 'object',
        description: field.description,
        properties: {
          firstName: {
            type: 'string',
            description: 'First name',
          },
          lastName: {
            type: 'string',
            description: 'Last name',
          },
        },
      };

    case FieldMetadataType.ADDRESS:
      return {
        type: 'object',
        description: field.description,
        properties: {
          addressStreet1: {
            type: 'string',
            description: 'Street address line 1',
          },
          addressStreet2: {
            type: 'string',
            description: 'Street address line 2',
          },
          addressCity: {
            type: 'string',
            description: 'City',
          },
          addressPostcode: {
            type: 'string',
            description: 'Postal code',
          },
          addressState: {
            type: 'string',
            description: 'State/Province',
          },
          addressCountry: {
            type: 'string',
            description: 'Country',
          },
          addressLat: {
            type: 'number',
            description: 'Latitude',
          },
          addressLng: {
            type: 'number',
            description: 'Longitude',
          },
        },
      };

    case FieldMetadataType.EMAILS:
      return {
        type: 'object',
        description: field.description,
        properties: {
          primaryEmail: {
            type: 'string',
            format: 'email',
            description: 'Primary email address',
          },
          additionalEmails: {
            type: 'array',
            description: 'Additional email addresses',
            items: {
              type: 'string',
              format: 'email',
            },
          },
        },
      };

    case FieldMetadataType.PHONES:
      return {
        type: 'object',
        description: field.description,
        properties: {
          primaryPhoneCountryCode: {
            type: 'string',
            description: 'Primary phone country code',
          },
          primaryPhoneCallingCode: {
            type: 'string',
            description: 'Primary phone calling code',
          },
          primaryPhoneNumber: {
            type: 'string',
            description: 'Primary phone number',
          },
          additionalPhones: {
            type: 'array',
            description: 'Additional phone numbers',
            items: {
              type: 'string',
            },
          },
        },
      };

    case FieldMetadataType.RAW_JSON:
      return {
        type: 'object',
        description: field.description,
      };

    default:
      return {
        type: 'string',
        description: field.description,
      };
  }
};
