import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs-extra';
import * as path from 'path';

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

export class SchemaValidator {
  private ajv: Ajv;
  private schemasLoaded = false;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });
    addFormats(this.ajv);
  }

  private async loadSchemas(): Promise<void> {
    if (this.schemasLoaded) return;

    const schemasDir = path.join(__dirname, '../../schemas');

    try {
      // Load agent schema
      const agentSchemaPath = path.join(schemasDir, 'agent.schema.json');
      const agentSchema = await fs.readJson(agentSchemaPath);
      this.ajv.addSchema(agentSchema, 'agent');

      // Load app manifest schema
      const appSchemaPath = path.join(schemasDir, 'app-manifest.schema.json');
      const appSchema = await fs.readJson(appSchemaPath);
      this.ajv.addSchema(appSchema, 'app-manifest');

      this.schemasLoaded = true;
    } catch {
      // Gracefully handle missing schemas in development
      console.warn('Warning: Could not load JSON schemas for validation');
      this.schemasLoaded = true; // Prevent retry
    }
  }

  async validateAgent(agent: any, filePath?: string): Promise<void> {
    await this.loadSchemas();

    const validate = this.ajv.getSchema('agent');
    if (!validate) {
      // Schema not available, skip validation
      return;
    }

    const valid = validate(agent);
    if (!valid) {
      const errorMessages = this.formatErrors(validate.errors || []);
      throw new SchemaValidationError(
        `Agent validation failed:\n${errorMessages}`,
        validate.errors || [],
        filePath,
      );
    }
  }

  async validateAppManifest(manifest: any, filePath?: string): Promise<void> {
    await this.loadSchemas();

    const validate = this.ajv.getSchema('app-manifest');
    if (!validate) {
      // Schema not available, skip validation
      return;
    }

    const valid = validate(manifest);
    if (!valid) {
      const errorMessages = this.formatErrors(validate.errors || []);
      throw new SchemaValidationError(
        `App manifest validation failed:\n${errorMessages}`,
        validate.errors || [],
        filePath,
      );
    }
  }

  private formatErrors(errors: any[]): string {
    return errors
      .map((error) => {
        const path = error.instancePath || 'root';
        const message = error.message;
        const value =
          error.data !== undefined
            ? ` (got: ${JSON.stringify(error.data)})`
            : '';
        return `  • ${path}: ${message}${value}`;
      })
      .join('\n');
  }

  // Get schema URLs for $schema references
  static getSchemaUrls() {
    return {
      agent:
        'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/agent.schema.json',
      appManifest:
        'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/app-manifest.schema.json',
    };
  }
}

// Singleton instance
export const schemaValidator = new SchemaValidator();
