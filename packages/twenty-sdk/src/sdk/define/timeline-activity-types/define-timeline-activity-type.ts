import { isNonEmptyString } from '@sniptt/guards';
import { isTimelineActivityAction } from 'twenty-shared/timeline';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type TimelineActivityTypeConfig } from '@/sdk/define/timeline-activity-types/timeline-activity-type-config';

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

  if (config.emit?.on && !isTimelineActivityAction(config.emit.on)) {
    errors.push(
      `TimelineActivityType emit.on ${config.emit.on} is not supported`,
    );
  }

  if (config.emit && !isNonEmptyString(config.emit.on)) {
    errors.push('TimelineActivityType emit must have an on action');
  }

  if (config.emit && !isNonEmptyString(config.emit.objectUniversalIdentifier)) {
    errors.push(
      'TimelineActivityType emit must have an objectUniversalIdentifier',
    );
  }

  if (
    config.emit?.through &&
    !isNonEmptyString(config.emit.through.relationFieldUniversalIdentifier)
  ) {
    errors.push(
      'TimelineActivityType emit.through must have a relationFieldUniversalIdentifier',
    );
  }

  if (
    (config.emit?.on === 'linked' || config.emit?.on === 'unlinked') &&
    !config.emit.through
  ) {
    errors.push(
      'TimelineActivityType linked and unlinked emitters require through routing',
    );
  }

  const triggerFieldUniversalIdentifiers =
    config.emit?.through?.triggerFieldUniversalIdentifiers;

  if (
    triggerFieldUniversalIdentifiers &&
    (config.emit?.on !== 'updated' ||
      !isNonEmptyArray(triggerFieldUniversalIdentifiers))
  ) {
    errors.push(
      'TimelineActivityType emit.through.triggerFieldUniversalIdentifiers requires an updated event',
    );
  }

  if (
    triggerFieldUniversalIdentifiers &&
    new Set(triggerFieldUniversalIdentifiers).size !==
      triggerFieldUniversalIdentifiers.length
  ) {
    errors.push(
      'TimelineActivityType emit.through.triggerFieldUniversalIdentifiers must be unique',
    );
  }

  if (config.replacesTimelineActivityTypeUniversalIdentifier && !config.emit) {
    errors.push(
      'TimelineActivityType replacesTimelineActivityTypeUniversalIdentifier requires emit',
    );
  }

  return createValidationResult({ config, errors });
};
