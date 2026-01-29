import { type FieldManifest } from 'twenty-shared/application';
import { isNonEmptyString } from '@sniptt/guards';
import { validateFieldsOrThrow } from '@/application';

export const defineField = <T extends FieldManifest>(config: T) => {
  if (!isNonEmptyString(config.objectUniversalIdentifier)) {
    throw new Error('Field must have an objectUniversalIdentifier');
  }

  validateFieldsOrThrow([config]);

  return config;
};
