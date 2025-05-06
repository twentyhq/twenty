import {
  EventMetadataValidationRule,
  EventSchema,
} from './schema-validation.rule';

describe('EventMetadataValidationRule', () => {
  describe('validate', () => {
    it('should validate required properties', () => {
      const schema: EventSchema = {
        required: ['userId', 'event'],
      };

      const rule = new EventMetadataValidationRule(schema);

      // Valid event with all required properties
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          userId: 'user123',
          event: 'click',
          optional: 'value',
        },
      };

      expect(rule.validate(event)).toBe(true);

      // Invalid event missing required property
      const invalidEvent = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          userId: 'user123',
          // missing required 'event' property
        },
      };

      expect(rule.validate(invalidEvent)).toBe(false);
    });

    it('should validate field types', () => {
      const schema: EventSchema = {
        fieldTypes: {
          userId: 'string',
          count: 'number',
          isActive: 'boolean',
          metadata: 'object',
        },
      };

      const rule = new EventMetadataValidationRule(schema);

      // Valid event with correct types
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          userId: 'user123',
          count: 5,
          isActive: true,
          metadata: { key: 'value' },
        },
      };

      expect(rule.validate(event)).toBe(true);

      // Invalid event with wrong type for a field
      const invalidEvent = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          userId: 'user123',
          count: 'not-a-number', // should be a number
        },
      };

      expect(rule.validate(invalidEvent)).toBe(false);
    });

    it('should validate allowed values', () => {
      const schema: EventSchema = {
        allowedValues: {
          status: ['pending', 'processing', 'completed'],
          priority: [1, 2, 3],
        },
      };

      const rule = new EventMetadataValidationRule(schema);

      // Valid event with allowed values
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          status: 'pending',
          priority: 2,
        },
      };

      expect(rule.validate(event)).toBe(true);

      // Invalid event with disallowed value
      const invalidEvent = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          status: 'unknown', // not in allowed values
        },
      };

      expect(rule.validate(invalidEvent)).toBe(false);
    });

    it('should handle strict validation', () => {
      const schema: EventSchema = {
        fieldTypes: {
          name: 'string',
        },
        strictValidation: false,
      };

      const rule = new EventMetadataValidationRule(schema);

      // Valid event with extra properties (allowed with strictValidation: false)
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          name: 'Test Event',
          unknownProp: 'some value',
        },
      };

      expect(rule.validate(event)).toBe(true);

      // With strict validation
      const strictSchema: EventSchema = {
        fieldTypes: {
          name: 'string',
        },
        strictValidation: true,
      };

      const strictRule = new EventMetadataValidationRule(strictSchema);

      const invalidEvent = {
        event: 'test.event',
        recordId: 'test-id',
        properties: {
          name: 'Test Event',
          unknownProp: 'some value', // not allowed with strictValidation: true
        },
      };

      expect(strictRule.validate(invalidEvent)).toBe(false);
    });

    it('should validate valid object types', () => {
      const schema: EventSchema = {
        validObjectTypes: ['user', 'account'],
      };

      const rule = new EventMetadataValidationRule(schema);

      // Valid event with valid object type
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        objectMetadataId: 'user',
        properties: {
          userId: 'user123',
          action: 'login',
          count: 1,
        },
      };

      expect(rule.validate(event)).toBe(true);

      // Invalid event with invalid object type
      const invalidEvent = {
        event: 'test.event',
        recordId: 'test-id',
        objectMetadataId: 'contact', // not in validObjectTypes
        properties: {
          userId: 'user123',
          action: 'view',
          count: 1,
        },
      };

      expect(rule.validate(invalidEvent)).toBe(false);
    });
  });
});
