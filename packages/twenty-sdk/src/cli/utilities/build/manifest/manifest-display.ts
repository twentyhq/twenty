import { type ApplicationManifest } from 'twenty-shared/application';
import { createLogger } from '../common/logger';
import { applicationEntityBuilder } from './entities/application';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { roleEntityBuilder } from './entities/role';
import { type ManifestValidationError, type ValidationWarning } from './manifest.types';

const logger = createLogger('manifest-watch');

export const displayEntitySummary = (manifest: ApplicationManifest): void => {
  applicationEntityBuilder.display(
    manifest.application ? [manifest.application] : [],
  );
  objectEntityBuilder.display(manifest.objects ?? []);
  functionEntityBuilder.display(manifest.serverlessFunctions ?? []);
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
