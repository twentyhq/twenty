import chalk from 'chalk';
import path from 'path';
import { type Application } from 'twenty-shared/application';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
    type EntityIdWithLocation,
    type ManifestEntityBuilder,
    type ManifestWithoutSources,
} from './entity.interface';

export class ApplicationEntityBuilder
  implements ManifestEntityBuilder<Application>
{
  async build(appPath: string): Promise<Application> {
    const applicationConfigPath = path.join(appPath, 'src', 'app', 'application.config.ts');

    return manifestExtractFromFileServer.extractManifestFromFile<Application>(applicationConfigPath);
  }

  validate(application: Application, errors: ValidationError[]): void {
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
  }

  display(application: Application): void {
    const appName = application.displayName ?? 'Application';
    console.log(chalk.green(`  ✓ Loaded "${appName}"`));
  }

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const application = manifest.application;

    if (application?.universalIdentifier) {
      seen.set(application.universalIdentifier, ['application']);
    }

    if (application?.applicationVariables) {
      for (const [name, variable] of Object.entries(
        application.applicationVariables,
      )) {
        if (variable.universalIdentifier) {
          const locations = seen.get(variable.universalIdentifier) ?? [];
          locations.push(`application.variables.${name}`);
          seen.set(variable.universalIdentifier, locations);
        }
      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const applicationEntityBuilder = new ApplicationEntityBuilder();
