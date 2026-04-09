import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { type JSONSchema7 } from 'json-schema';

class ValidationSchemaManager {
  private static instance: ValidationSchemaManager;
  private schemas: Record<string, JSONSchema7> | null = null;

  private constructor() {}

  public static getInstance(): ValidationSchemaManager {
    if (!ValidationSchemaManager.instance) {
      ValidationSchemaManager.instance = new ValidationSchemaManager();
    }

    return ValidationSchemaManager.instance;
  }

  public getSchemas(): Record<string, JSONSchema7> {
    if (!this.schemas) {
      this.schemas = validationMetadatasToSchemas() as Record<
        string,
        JSONSchema7
      >;
    }

    return this.schemas;
  }
}

export const validationSchemaManager = ValidationSchemaManager.getInstance();
