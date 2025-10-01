import Ajv from 'ajv';
import * as fs from 'fs-extra';
import * as path from 'path';
import {
  AGENT_SCHEMA_URL,
  APP_MANIFEST_SCHEMA_URL,
  OBJECT_SCHEMA_URL,
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
  schemaName: 'app-manifest' | 'agent' | 'object',
  manifest: any,
  filePath?: string,
): Promise<void> => {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
  });

  const schemaUrls = getSchemaUrls();
  let schema;

  for (const name of Object.keys(schemaUrls) as (keyof typeof schemaUrls)[]) {
    const formattedName = name === 'appManifest' ? 'app-manifest' : name;
    const schemasDir = path.join(__dirname, '../../schemas');
    const schemaPath = path.join(schemasDir, `${formattedName}.schema.json`);
    ajv.addSchema(await fs.readJson(schemaPath));

    if (formattedName === schemaName) {
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
    agent: AGENT_SCHEMA_URL,
    object: OBJECT_SCHEMA_URL,
    appManifest: APP_MANIFEST_SCHEMA_URL,
  };
};
