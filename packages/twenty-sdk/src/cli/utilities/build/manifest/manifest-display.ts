import { type ApplicationManifest } from 'twenty-shared/application';
import { createLogger } from '../common/logger';
import { frontComponentEntityBuilder } from '@/cli/utilities/build/manifest/entities/front-component';
import { functionEntityBuilder } from '@/cli/utilities/build/manifest/entities/function';
import { objectEntityBuilder } from '@/cli/utilities/build/manifest/entities/object';
import { roleEntityBuilder } from '@/cli/utilities/build/manifest/entities/role';
import {
  type ManifestValidationError,
  type ValidationWarning,
} from '@/cli/utilities/build/manifest/manifest.types';
import { applicationEntityBuilder } from '@/cli/utilities/build/manifest/entities/application';

const logger = createLogger('manifest-watch');

export const displayEntitySummary = (manifest: ApplicationManifest): void => {
  applicationEntityBuilder.display(
    manifest.application ? [manifest.application] : [],
  );
  objectEntityBuilder.display(manifest.objects ?? []);
  functionEntityBuilder.display(manifest.functions ?? []);
  frontComponentEntityBuilder.display(manifest.frontComponents ?? []);
  roleEntityBuilder.display(manifest.roles ?? []);
};

export const displayErrors = (error: ManifestValidationError): void => {
  logger.error('✗ Validation failed:');
  for (const err of error.errors) {
    logger.error(`  • ${err.path}: ${err.message}`);
  }
};

export const displayWarnings = (warnings: ValidationWarning[]): void => {
  if (warnings.length === 0) {
    return;
  }

  for (const warning of warnings) {
    const path = warning.path ? `${warning.path}: ` : '';
    logger.warn(`⚠ ${path}${warning.message}`);
  }
};
