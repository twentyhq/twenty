import chalk from 'chalk';
import { glob } from 'fast-glob';
import { type FrontComponentManifest } from 'twenty-shared/application';
import { manifestExtractFromFileServer } from '../manifest-extract-from-file-server';
import { type ValidationError } from '../manifest.types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from './entity.interface';

type FrontComponentConfig = Omit<FrontComponentManifest, 'componentPath' | 'componentName'> & {
  component: { name: string };
};

export class FrontComponentEntityBuilder
  implements ManifestEntityBuilder<FrontComponentManifest>
{
  async build(appPath: string): Promise<EntityBuildResult<FrontComponentManifest>> {
    const componentFiles = await glob(['**/*.front-component.tsx'], {
      cwd: appPath,
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
    });

    const manifests: FrontComponentManifest[] = [];

    for (const filePath of componentFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;
        const config =
          await manifestExtractFromFileServer.extractManifestFromFile<FrontComponentConfig>(
            absolutePath,
          );

        const { component, ...rest } = config;

        manifests.push({
          ...rest,
          componentName: component.name,
          componentPath: filePath,
        });
      } catch (error) {
        throw new Error(
          `Failed to load front component from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: componentFiles };
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
