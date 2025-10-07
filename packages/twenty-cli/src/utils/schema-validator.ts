import Ajv from 'ajv';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  AGENT_SCHEMA_URL,
  APP_MANIFEST_SCHEMA_URL,
  OBJECT_SCHEMA_URL,
  SERVERLESS_FUNCTION_SCHEMA_URL,
  TRIGGER_SCHEMA_URL,
} from '../constants/schemas';

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: any[],
    public readonly filePath?: string,
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

const formatErrors = (errors: any[]): string => {
  return errors
    .map((error) => {
      const path = error.instancePath || 'root';
      const message = error.message;
      const value =
        error.data !== undefined ? ` (got: ${JSON.stringify(error.data)})` : '';
      return `  • ${path}: ${message}${value}`;
    })
    .join('\n');
};

export const validateSchema = async (
  schemaName: 'appManifest' | 'agent' | 'object' | 'serverlessFunction',
  manifest: any,
  filePath?: string,
): Promise<void> => {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    $data: true,
  });

  const schemaUrls = getSchemaUrls();

  let schema;

  for (const name of Object.keys(schemaUrls) as (keyof typeof schemaUrls)[]) {
    const schemasDir = path.join(__dirname, '../../schemas');
    const schemaPath = path.join(schemasDir, `${name}.schema.json`);
    ajv.addSchema(await fs.readJson(schemaPath));

    if (name === schemaName) {
      schema = ajv.getSchema(schemaUrls[name])?.schema;
    }
  }

  if (!schema) throw new Error(`Schema ${schemaName} not found.`);

  const valid = ajv.validate(schema, manifest);

  if (!valid) {
    const errorMessages = formatErrors(ajv.errors || []);
    throw new SchemaValidationError(
      `${schemaName} validation failed:\n${errorMessages}`,
      ajv.errors || [],
      filePath,
    );
  }
};

export const getSchemaUrls = () => {
  return {
    trigger: TRIGGER_SCHEMA_URL,
    agent: AGENT_SCHEMA_URL,
    object: OBJECT_SCHEMA_URL,
    serverlessFunction: SERVERLESS_FUNCTION_SCHEMA_URL,
    appManifest: APP_MANIFEST_SCHEMA_URL,
  };
};
