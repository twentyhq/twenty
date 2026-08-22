import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type TimelineActivityTypeConfig } from '@/sdk/define/timeline-activity-types/timeline-activity-type-config';
import { isTimelineActivityAction } from 'twenty-shared/timeline';

export const defineTimelineActivityType: DefineEntity<
  TimelineActivityTypeConfig
> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('TimelineActivityType must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('TimelineActivityType must have a name');
  }

  if (!config.label) {
    errors.push('TimelineActivityType must have a label');
  }

  if (config.action && !isTimelineActivityAction(config.action)) {
    errors.push(
      `TimelineActivityType action ${config.action} is not supported`,
    );
  }

  if (
    config.targetRelationFieldUniversalIdentifier &&
    (!config.action || !config.objectUniversalIdentifier)
  ) {
    errors.push(
      'TimelineActivityType targetRelationFieldUniversalIdentifier requires action and objectUniversalIdentifier',
    );
  }

  if (
    config.triggerFieldUniversalIdentifiers &&
    (config.action !== 'updated' ||
      !config.targetRelationFieldUniversalIdentifier ||
      config.triggerFieldUniversalIdentifiers.length === 0)
  ) {
    errors.push(
      'TimelineActivityType triggerFieldUniversalIdentifiers requires an updated target relation event',
    );
  }

  if (
    config.triggerFieldUniversalIdentifiers &&
    new Set(config.triggerFieldUniversalIdentifiers).size !==
      config.triggerFieldUniversalIdentifiers.length
  ) {
    errors.push(
      'TimelineActivityType triggerFieldUniversalIdentifiers must be unique',
    );
  }

  if (
    config.overridesTimelineActivityTypeUniversalIdentifier &&
    (!config.action || !config.objectUniversalIdentifier)
  ) {
    errors.push(
      'TimelineActivityType overridesTimelineActivityTypeUniversalIdentifier requires action and objectUniversalIdentifier',
    );
  }

  return createValidationResult({ config, errors });
};
