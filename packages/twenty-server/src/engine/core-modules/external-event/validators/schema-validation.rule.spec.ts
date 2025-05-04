import {
  EventMetadataValidationRule,
  EventSchema,
} from './schema-validation.rule';

describe('EventMetadataValidationRule', () => {
  describe('required fields validation', () => {
    it('should validate event with all required fields', () => {
      const schema: EventSchema = {
        required: ['userId', 'event'],
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          event: 'click',
          optional: 'value',
        },
      };

      expect(rule.validate(event)).toBe(true);
    });

    it('should fail validation when required field is missing', () => {
      const schema: EventSchema = {
        required: ['userId', 'event'],
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          // event field is missing
        },
      };

      expect(rule.validate(event)).toBe(false);
      expect(rule.getErrorMessage()).toContain(
        "Required property 'event' is missing",
      );
    });
  });

  describe('field type validation', () => {
    it('should validate event with correct field types', () => {
      const schema: EventSchema = {
        fieldTypes: {
          userId: 'string',
          count: 'number',
          isActive: 'boolean',
          metadata: 'object',
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          count: 5,
          isActive: true,
          metadata: { key: 'value' },
        },
      };

      expect(rule.validate(event)).toBe(true);
    });

    it('should fail validation when field type is incorrect', () => {
      const schema: EventSchema = {
        fieldTypes: {
          userId: 'string',
          count: 'number',
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          count: '5', // should be number but is string
        },
      };

      expect(rule.validate(event)).toBe(false);
      expect(rule.getErrorMessage()).toContain(
        "Property 'count' should be of type 'number'",
      );
    });
  });

  describe('allowed values validation', () => {
    it('should validate event with allowed values', () => {
      const schema: EventSchema = {
        allowedValues: {
          status: ['active', 'inactive', 'pending'],
          priority: [1, 2, 3],
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.status',
        objectId: 'test-id',
        properties: {
          status: 'active',
          priority: 2,
        },
      };

      expect(rule.validate(event)).toBe(true);
    });

    it('should fail validation when value is not in allowed values', () => {
      const schema: EventSchema = {
        allowedValues: {
          status: ['active', 'inactive', 'pending'],
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.status',
        objectId: 'test-id',
        properties: {
          status: 'deleted', // not in allowed values
        },
      };

      expect(rule.validate(event)).toBe(false);
      expect(rule.getErrorMessage()).toContain('not in the allowed values');
    });
  });

  describe('strictValidation setting', () => {
    it('should accept unknown properties when strictValidation is false', () => {
      const schema: EventSchema = {
        fieldTypes: {
          name: 'string',
        },
        strictValidation: false,
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          name: 'Test',
          unknownProp: 'value', // unknown property
        },
      };

      expect(rule.validate(event)).toBe(true);
    });

    it('should reject unknown properties when strictValidation is true', () => {
      const schema: EventSchema = {
        fieldTypes: {
          name: 'string',
        },
        strictValidation: true,
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          name: 'Test',
          unknownProp: 'value', // unknown property
        },
      };

      expect(rule.validate(event)).toBe(false);
      expect(rule.getErrorMessage()).toContain('Unknown properties found');
    });
  });

  describe('combined validations', () => {
    it('should validate event with combined validation rules', () => {
      const schema: EventSchema = {
        required: ['userId', 'action'],
        fieldTypes: {
          userId: 'string',
          count: 'number',
        },
        allowedValues: {
          action: ['click', 'view', 'submit'],
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          action: 'click',
          count: 5,
        },
      };

      expect(rule.validate(event)).toBe(true);
    });

    it('should fail validation when any rule fails', () => {
      const schema: EventSchema = {
        required: ['userId', 'action'],
        fieldTypes: {
          userId: 'string',
          count: 'number',
        },
        allowedValues: {
          action: ['click', 'view', 'submit'],
        },
      };

      const rule = new EventMetadataValidationRule(schema);
      const event = {
        event: 'user.action',
        objectId: 'test-id',
        properties: {
          userId: '123',
          action: 'hover', // not in allowed values
          count: 5,
        },
      };

      expect(rule.validate(event)).toBe(false);
    });
  });
});
