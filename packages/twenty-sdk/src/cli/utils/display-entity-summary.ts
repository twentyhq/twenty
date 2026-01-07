import chalk from 'chalk';
import { type ApplicationManifest } from 'twenty-shared/application';

export const displayEntitySummary = (manifest: ApplicationManifest): void =>{
  const appName = manifest.application.displayName ?? 'Application';
  console.log(chalk.green(`  ✓ Loaded "${appName}"`));
  console.log(chalk.green(`  ✓ Found ${manifest.objects.length} object(s)`));
  console.log(
    chalk.green(
      `  ✓ Found ${manifest.serverlessFunctions.length} function(s)`,
    ),
  );
  console.log(
    chalk.green(`  ✓ Found ${manifest.roles?.length || 'no'} role(s)`),
  );
}
