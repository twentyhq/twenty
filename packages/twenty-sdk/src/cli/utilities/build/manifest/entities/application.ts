import { glob } from 'fast-glob';
import path from 'path';
import { type Application } from 'twenty-shared/application';
import { createLogger } from '../../common/logger';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from './entity.interface';

const logger = createLogger('manifest-watch');

const findApplicationConfigPath = async (appPath: string): Promise<string> => {
  const files = await glob('**/application.config.ts', {
    cwd: appPath,
    ignore: ['**/node_modules/**', '**/.twenty/**', '**/dist/**'],
  });

  if (files.length === 0) {
    throw new Error('Missing application.config.ts in your app');
  }

  if (files.length > 1) {
    throw new Error(
      `Multiple application.config.ts files found: ${files.join(', ')}. Only one is allowed.`,
    );
  }

  return path.join(appPath, files[0]);
};

export class ApplicationEntityBuilder
  implements ManifestEntityBuilder<Application>
{
  async build(appPath: string): Promise<EntityBuildResult<Application>> {
    const applicationConfigPath = await findApplicationConfigPath(appPath);
    const application =
      await manifestExtractFromFileServer.extractManifestFromFile<Application>(
        applicationConfigPath,
      );
    const relativePath = path.relative(appPath, applicationConfigPath);

    return { manifests: [application], filePaths: [relativePath] };
  }

  validate(applications: Application[], errors: ValidationError[]): void {
    const application = applications[0];

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

  display(applications: Application[]): void {
    const application = applications[0];
    const appName = application?.displayName ?? 'Application';
    logger.success(`✓ Loaded "${appName}"`);
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
