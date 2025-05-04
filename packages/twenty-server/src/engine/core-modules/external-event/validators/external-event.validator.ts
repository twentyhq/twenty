import { Injectable } from '@nestjs/common';

import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from 'src/engine/core-modules/external-event/external-event.exception';
import { ExternalEventInput } from 'src/engine/core-modules/external-event/services/external-event.service';

/**
 * Interface for event validation rules
 */
export interface EventValidationRule {
  validate(event: ExternalEventInput): boolean;
  getErrorMessage(): string;
}

/**
 * Base event validation rule
 * Validates the basic structure required for all events
 */
export class BaseEventValidationRule implements EventValidationRule {
  private validationError: string | null = null;

  validate(event: ExternalEventInput): boolean {
    // Validate event name
    if (typeof event.event !== 'string' || event.event.trim().length === 0) {
      this.validationError = 'Event name is required and must be a string';

      return false;
    }

    // Validate objectId
    if (
      typeof event.objectId !== 'string' ||
      event.objectId.trim().length === 0
    ) {
      this.validationError = 'Object ID is required and must be a string';

      return false;
    }

    // Validate properties
    if (
      !event.properties ||
      typeof event.properties !== 'object' ||
      Array.isArray(event.properties)
    ) {
      this.validationError = 'Properties must be a valid object';

      return false;
    }

    return true;
  }

  getErrorMessage(): string {
    return this.validationError || 'Invalid event structure';
  }
}

/**
 * Service for validating external events
 */
@Injectable()
export class ExternalEventValidator {
  /**
   * Base validation rule that applies to all events
   */
  private baseRule = new BaseEventValidationRule();

  /**
   * Event-specific validation rules keyed by event name
   */
  private eventSpecificRules: Map<string, EventValidationRule[]> = new Map();

  /**
   * Register a new validation rule for a specific event
   * @param eventName The event name to validate
   * @param rule The validation rule to apply
   */
  registerEventRule(eventName: string, rule: EventValidationRule): void {
    const rules = this.eventSpecificRules.get(eventName) || [];

    rules.push(rule);
    this.eventSpecificRules.set(eventName, rules);
  }

  /**
   * Validate an external event against all applicable rules
   * @param event The event to validate
   * @throws ExternalEventException if validation fails
   */
  validate(event: ExternalEventInput): void {
    // Apply base rule first (platform-level validation)
    if (!this.baseRule.validate(event)) {
      throw new ExternalEventException(
        this.baseRule.getErrorMessage(),
        ExternalEventExceptionCode.INVALID_INPUT,
      );
    }

    // Apply event-specific rules if they exist (workspace-level validation)
    const eventRules = this.eventSpecificRules.get(event.event);

    if (eventRules) {
      for (const rule of eventRules) {
        if (!rule.validate(event)) {
          throw new ExternalEventException(
            rule.getErrorMessage(),
            ExternalEventExceptionCode.INVALID_INPUT,
          );
        }
      }
    }
  }
}
