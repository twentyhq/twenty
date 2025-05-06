import { Test, TestingModule } from '@nestjs/testing';

import { ExternalEventException } from 'src/engine/core-modules/external-event/external-event.exception';

import {
  EventValidationRule,
  ExternalEventValidator,
} from './external-event.validator';

describe('ExternalEventValidator', () => {
  let validator: ExternalEventValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalEventValidator],
    }).compile();

    validator = module.get<ExternalEventValidator>(ExternalEventValidator);
  });

  describe('validate', () => {
    it('should validate a valid event', () => {
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: { data: 'value' },
      };

      expect(() => validator.validate(event)).not.toThrow();
    });

    it('should throw an exception for empty event name', () => {
      const event = {
        event: '',
        recordId: 'test-id',
        properties: { data: 'value' },
      };

      expect(() => validator.validate(event)).toThrow(ExternalEventException);
    });

    it('should throw an exception for non-string event name', () => {
      const event = {
        event: 123 as any,
        recordId: 'test-id',
        properties: { data: 'value' },
      };

      expect(() => validator.validate(event)).toThrow(ExternalEventException);
    });

    it('should throw an exception for null properties', () => {
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: null as any,
      };

      expect(() => validator.validate(event)).toThrow(ExternalEventException);
    });

    it('should throw an exception for array properties', () => {
      const event = {
        event: 'test.event',
        recordId: 'test-id',
        properties: [] as any,
      };

      expect(() => validator.validate(event)).toThrow(ExternalEventException);
    });
  });

  describe('event-specific validation rules', () => {
    class TestCustomRule implements EventValidationRule {
      validate(event: any): boolean {
        return event.properties.requiredField !== undefined;
      }

      getErrorMessage(): string {
        return 'Missing required field';
      }
    }

    beforeEach(() => {
      validator.registerEventRule('custom.event', new TestCustomRule());
    });

    it('should pass validation for custom event type with required field', () => {
      const event = {
        event: 'custom.event',
        recordId: 'test-id',
        properties: { requiredField: 'value' },
      };

      expect(() => validator.validate(event)).not.toThrow();
    });

    it('should throw an exception for custom event type without required field', () => {
      const event = {
        event: 'custom.event',
        recordId: 'test-id',
        properties: { otherField: 'value' },
      };

      expect(() => validator.validate(event)).toThrow(ExternalEventException);
    });

    it('should not apply event-specific rules to other event types', () => {
      const event = {
        event: 'other.event',
        recordId: 'test-id',
        properties: { otherField: 'value' },
      };

      expect(() => validator.validate(event)).not.toThrow();
    });
  });
});
