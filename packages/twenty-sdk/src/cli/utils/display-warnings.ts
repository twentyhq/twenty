import type { ValidationWarning } from '@/cli/utils/validate-manifest';
import chalk from 'chalk';

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
