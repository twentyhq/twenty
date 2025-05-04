import { ExternalEventInput } from 'src/engine/core-modules/external-event/services/external-event.service';

import { EventValidationRule } from './external-event.validator';

/**
 * Defines the schema for validating event properties
 */
export interface EventSchema {
  // Required property fields that must be present
  required?: string[];

  // Property field types for validation
  fieldTypes?: Record<string, 'string' | 'number' | 'boolean' | 'object'>;

  // Allowed values for specific properties
  allowedValues?: Record<string, any[]>;

  // Valid object types (if restricted)
  validObjectTypes?: string[];

  // Whether to enforce strict validation (reject unknown fields)
  strictValidation?: boolean;
}

/**
 * Metadata-based validation rule that validates events against metadata
 */
export class EventMetadataValidationRule implements EventValidationRule {
  private errorMessage = 'Event does not match the required schema';
  private validationError: string | null = null;

  constructor(private readonly schema: EventSchema) {}

  validate(event: ExternalEventInput): boolean {
    // Validate object type if restricted
    if (this.schema.validObjectTypes?.length && event.objectType) {
      if (!this.schema.validObjectTypes.includes(event.objectType)) {
        this.validationError = `Object type '${event.objectType}' is not valid for this event. Valid types: ${this.schema.validObjectTypes.join(', ')}`;

        return false;
      }
    }

    // Check required property fields
    if (this.schema.required) {
      for (const field of this.schema.required) {
        if (!event.properties || event.properties[field] === undefined) {
          this.validationError = `Required property '${field}' is missing`;

          return false;
        }
      }
    }

    // Check property field types
    if (this.schema.fieldTypes && event.properties) {
      for (const [field, expectedType] of Object.entries(
        this.schema.fieldTypes,
      )) {
        if (event.properties[field] !== undefined) {
          const actualType = Array.isArray(event.properties[field])
            ? 'array'
            : typeof event.properties[field];

          if (actualType !== expectedType) {
            this.validationError = `Property '${field}' should be of type '${expectedType}' but got '${actualType}'`;

            return false;
          }
        }
      }

      // If strict validation is enabled, check for unknown properties
      if (this.schema.strictValidation === true && event.properties) {
        const knownFields = Object.keys(this.schema.fieldTypes);
        const unknownFields = Object.keys(event.properties).filter(
          (prop) => !knownFields.includes(prop),
        );

        if (unknownFields.length > 0) {
          this.validationError = `Unknown properties found: ${unknownFields.join(', ')}`;

          return false;
        }
      }
    }

    // Check allowed values
    if (this.schema.allowedValues && event.properties) {
      for (const [field, allowedValues] of Object.entries(
        this.schema.allowedValues,
      )) {
        if (
          event.properties[field] !== undefined &&
          !allowedValues.includes(event.properties[field])
        ) {
          this.validationError = `Property '${field}' has value '${event.properties[field]}' which is not in the allowed values: ${allowedValues.join(', ')}`;

          return false;
        }
      }
    }

    return true;
  }

  getErrorMessage(): string {
    return this.validationError || this.errorMessage;
  }
}
