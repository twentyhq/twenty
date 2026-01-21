import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';
import { displayApplication } from './entities/application';
import { displayFrontComponents } from './entities/front-component';
import { displayFunctions } from './entities/function';
import { displayObjects } from './entities/object';
import { displayRoles } from './entities/role';
import { type ManifestValidationError, type ValidationWarning } from './manifest.types';

export const displayEntitySummary = (manifest: ApplicationManifest): void => {
  displayApplication(manifest);
  displayObjects(manifest.objects);
  displayFunctions(manifest.serverlessFunctions);
  displayFrontComponents(manifest.frontComponents ?? []);
  displayRoles(manifest.roles ?? []);
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
