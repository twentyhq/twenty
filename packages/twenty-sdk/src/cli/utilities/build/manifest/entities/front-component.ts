import { toPosixRelative } from '@/cli/utilities/file/utils/file-path';
import chalk from 'chalk';
import { glob } from 'fast-glob';
import { type FrontComponentManifest } from 'twenty-shared/application';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';
import {
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from './entity.interface';

export class FrontComponentEntityBuilder
  implements ManifestEntityBuilder<FrontComponentManifest[]>
{
  async build(appPath: string): Promise<FrontComponentManifest[]> {
    const componentFiles = await glob(['src/app/**/*.front-component.tsx'], {
      cwd: appPath,
      absolute: true,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
    });

    const frontComponentManifests: FrontComponentManifest[] = [];

    for (const filepath of componentFiles) {
      try {
        frontComponentManifests.push(
          await extractManifestFromFile<FrontComponentManifest>(
            filepath,
            appPath,
            { entryProperty: 'component', jsx: true },
          ),
        );
      } catch (error) {
        const relPath = toPosixRelative(filepath, appPath);
        throw new Error(
          `Failed to load front component from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return frontComponentManifests;
  }

  validate(
    components: FrontComponentManifest[],
    errors: ValidationError[],
  ): void {
    for (const component of components) {
      const componentPath = `front-components/${component.name ?? component.componentName ?? 'unknown'}`;

      if (!component.universalIdentifier) {
        errors.push({
          path: componentPath,
          message: 'Front component must have a universalIdentifier',
        });
      }
    }
  }

  display(components: FrontComponentManifest[]): void {
    console.log(chalk.green(`  ✓ Found ${components.length} front component(s)`));

    if (components.length > 0) {
      console.log(chalk.gray(`  📍 Front component entry points:`));
      for (const component of components) {
        const name = component.name || component.universalIdentifier;
        console.log(chalk.gray(`     - ${name} (${component.componentPath})`));
      }
    }
  }

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const components = manifest.frontComponents ?? [];

    for (const component of components) {
      if (component.universalIdentifier) {
        const location = `front-components/${component.name ?? component.componentName}`;
        const locations = seen.get(component.universalIdentifier) ?? [];
        locations.push(location);
        seen.set(component.universalIdentifier, locations);
      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const frontComponentEntityBuilder = new FrontComponentEntityBuilder();
