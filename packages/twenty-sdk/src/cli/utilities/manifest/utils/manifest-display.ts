import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';
import {
  type ManifestValidationError,
  type ValidationWarning,
} from '../types/manifest.types';

export const displayEntitySummary = (manifest: ApplicationManifest): void => {
  const appName = manifest.application.displayName ?? 'Application';
  console.log(chalk.green(`  ✓ Loaded "${appName}"`));
  console.log(chalk.green(`  ✓ Found ${manifest.objects.length} object(s)`));
  console.log(
    chalk.green(`  ✓ Found ${manifest.serverlessFunctions.length} function(s)`),
  );
  console.log(
    chalk.green(
      `  ✓ Found ${manifest.frontComponents?.length ?? 0} front component(s)`,
    ),
  );
  console.log(
    chalk.green(`  ✓ Found ${manifest.roles?.length ?? 'no'} role(s)`),
  );
};

export const displayErrors = (error: ManifestValidationError): void => {
  console.log(chalk.red('\n  ✗ Manifest validation failed:\n'));
  for (const err of error.errors) {
    console.log(chalk.red(`    • ${err.path}: ${err.message}`));
  }
  console.log('');
};

export const displayWarnings = (warnings?: ValidationWarning[]): void => {
  if (!warnings || warnings.length === 0) {
    return;
  }

  console.log('');
  for (const warning of warnings) {
    const path = warning.path ? `${warning.path}: ` : '';
    console.log(chalk.yellow(`  ⚠ ${path}${warning.message}`));
  }
};
