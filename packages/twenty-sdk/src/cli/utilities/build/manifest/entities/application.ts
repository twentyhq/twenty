import chalk from 'chalk';
import path from 'path';
import { type Application, type ApplicationManifest } from 'twenty-shared/application';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';

export const buildApplication = async (appPath: string): Promise<Application> => {
  const applicationConfigPath = path.join(appPath, 'src', 'app', 'application.config.ts');

  return extractManifestFromFile<Application>(applicationConfigPath, appPath);
};

export const validateApplication = (
  application: Application | undefined,
  errors: ValidationError[],
): void => {
  if (!application) {
    errors.push({
      path: 'application',
      message: 'Application config is required',
    });
    return;
  }

  if (!application.universalIdentifier) {
    errors.push({
      path: 'application',
      message: 'Application must have a universalIdentifier',
    });
  }
};

export const displayApplication = (manifest: ApplicationManifest): void => {
  const appName = manifest.application.displayName ?? 'Application';
  console.log(chalk.green(`  ✓ Loaded "${appName}"`));
};

export const collectApplicationIds = (
  application: Application | undefined,
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  if (application?.universalIdentifier) {
    ids.push({
      id: application.universalIdentifier,
      location: 'application',
    });
  }

  if (application?.applicationVariables) {
    for (const [name, variable] of Object.entries(application.applicationVariables)) {
      if (variable.universalIdentifier) {
        ids.push({
          id: variable.universalIdentifier,
          location: `application.variables.${name}`,
        });
      }
    }
  }

  return ids;
};
