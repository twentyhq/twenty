import { isDefined } from 'twenty-shared/utils';
import { HTTPMethod } from 'twenty-shared/types';
import {
  type DatabaseEventTriggerSettings,
  type HttpRouteTriggerSettings,
} from 'twenty-shared/application';

export type TriggerKind = 'http' | 'cron' | 'databaseEvent' | 'tool';

type ToolInputSchemaShape = {
  properties?: Record<string, { type?: string; default?: unknown }>;
};

const sampleValueForType = (type?: string): unknown => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
};

export const buildToolPayloadFromSchema = (schema?: object): object => {
  const properties = (schema as ToolInputSchemaShape | undefined)?.properties;
  if (!isDefined(properties)) {
    return {};
  }
  const payload: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(properties)) {
    payload[key] = isDefined(prop.default)
      ? prop.default
      : sampleValueForType(prop.type);
  }
  return payload;
};

export const buildHttpPayload = (
  settings: HttpRouteTriggerSettings,
): object => {
  return {
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    body: settings.httpMethod === HTTPMethod.GET ? null : {},
    isBase64Encoded: false,
    requestContext: {
      http: {
        method: settings.httpMethod,
        path: `/s${settings.path}`,
      },
    },
  };
};

export const buildDatabaseEventPayload = (
  settings: DatabaseEventTriggerSettings,
): object => {
  const [object, action] = settings.eventName.split('.');
  return {
    name: settings.eventName,
    objectMetadata: { nameSingular: object },
    properties: {
      after: {},
      before: action === 'created' ? null : {},
      updatedFields: settings.updatedFields ?? [],
    },
  };
};
