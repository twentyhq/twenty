import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';
import { applicationEntityBuilder } from './entities/application';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { roleEntityBuilder } from './entities/role';
import { type ManifestValidationError, type ValidationWarning } from './manifest.types';

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
  console.log(chalk.red('\n  ✗ Manifest validation failed:\n'));
  for (const err of error.errors) {
    console.log(chalk.red(`    • ${err.path}: ${err.message}`));
  }
  console.log('');
};

export const displayWarnings = (warnings: ValidationWarning[]): void => {
  if (warnings.length === 0) {
    return;
  }

  console.log('');
  for (const warning of warnings) {
    const path = warning.path ? `${warning.path}: ` : '';
    console.log(chalk.yellow(`  ⚠ ${path}${warning.message}`));
  }
};
