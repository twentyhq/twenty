import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import {
  type EventManifest,
  getEventDefinitionErrors,
} from 'twenty-shared/application';
import { isNonEmptyString } from 'twenty-shared/utils';

export const defineEvent: DefineEntity<EventManifest> = (config) => {
  const errors: string[] = [];

  if (!isNonEmptyString(config.universalIdentifier)) {
    errors.push('Event must have a universalIdentifier');
  } else if (!isValidPostgresUuid(config.universalIdentifier)) {
    errors.push(
      `Event universalIdentifier "${config.universalIdentifier}" must be a UUID. Generate one with \`uuidgen\` or any UUID v4 tool.`,
    );
  }

  if (!isNonEmptyString(config.name)) {
    errors.push('Event must have a name');
  }

  if (!isNonEmptyString(config.label)) {
    errors.push('Event must have a label');
  }

  if (isNonEmptyString(config.name)) {
    errors.push(
      ...getEventDefinitionErrors({
        name: config.name,
        properties: config.properties ?? [],
        capabilities: config.capabilities,
      }),
    );
  }

  return createValidationResult({ config, errors });
};
