import { type OpenAPIV3_1 } from 'openapi-types';
import { capitalize } from 'twenty-shared/utils';

type SchemaOrRef = OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;

export type MetadataSchemaConfig = {
  nameSingular: string;
  namePlural: string;
  description: string;
  properties: Record<string, SchemaOrRef>;
  requiredFields?: string[];
  updateDescription?: string;
  updateProperties: Record<string, SchemaOrRef>;
  responseExtraProperties?: Record<string, SchemaOrRef>;
  responseCommonProperties?: Record<string, SchemaOrRef>;
  extraSchemas?: Record<string, OpenAPIV3_1.SchemaObject>;
};

const DEFAULT_RESPONSE_COMMON_PROPERTIES: Record<string, SchemaOrRef> = {
  workspaceId: { type: 'string', format: 'uuid' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
  deletedAt: { type: 'string', format: 'date-time' },
};

const stripDefaults = (
  properties: Record<string, SchemaOrRef>,
): Record<string, SchemaOrRef> => {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      if ('default' in value) {
        const { default: _, ...rest } = value;

        return [key, rest];
      }

      return [key, value];
    }),
  );
};

export const computeMetadataSchemaForEntity = (
  config: MetadataSchemaConfig,
): Record<string, OpenAPIV3_1.SchemaObject> => {
  const {
    nameSingular,
    namePlural,
    description,
    properties,
    requiredFields,
    updateDescription,
    updateProperties,
    responseExtraProperties = {},
    responseCommonProperties = DEFAULT_RESPONSE_COMMON_PROPERTIES,
    extraSchemas = {},
  } = config;

  const singularKey = capitalize(nameSingular);
  const pluralKey = capitalize(namePlural);

  const schemas: Record<string, OpenAPIV3_1.SchemaObject> = {
    ...extraSchemas,
  };

  schemas[singularKey] = {
    type: 'object',
    description,
    properties,
    ...(requiredFields?.length ? { required: requiredFields } : {}),
  };

  schemas[pluralKey] = {
    type: 'array',
    description: `A list of ${namePlural}`,
    items: {
      $ref: `#/components/schemas/${singularKey}`,
    },
  };

  schemas[`${singularKey}ForUpdate`] = {
    type: 'object',
    description: updateDescription ?? `${description} for update`,
    properties: updateProperties,
  };

  schemas[`${singularKey}ForResponse`] = {
    type: 'object',
    description,
    properties: {
      id: { type: 'string', format: 'uuid' },
      ...stripDefaults(properties),
      ...responseExtraProperties,
      ...responseCommonProperties,
    },
  };

  schemas[`${pluralKey}ForResponse`] = {
    type: 'array',
    description: `A list of ${namePlural}`,
    items: {
      $ref: `#/components/schemas/${singularKey}ForResponse`,
    },
  };

  return schemas;
};
