import { type ManifestValidationError } from '@/cli/utils/validate-manifest';
import chalk from 'chalk';

export const displayErrors = (error: ManifestValidationError): void => {
  console.log(chalk.red('\n  ✗ Manifest validation failed:\n'));
  for (const err of error.errors) {
    console.log(chalk.red(`    • ${err.path}: ${err.message}`));
  }
  console.log('');
};
