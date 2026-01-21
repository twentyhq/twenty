import chalk from 'chalk';
import { glob } from 'fast-glob';
import { posix, relative, sep } from 'path';
import { type FrontComponentManifest } from 'twenty-shared/application';
import { extractManifestFromFile } from '../manifest-file-extractor';
import { type ValidationError } from '../manifest.types';

const toPosixRelative = (filepath: string, appPath: string): string => {
  const rel = relative(appPath, filepath);
  return rel.split(sep).join(posix.sep);
};

export const buildFrontComponents = async (
  appPath: string,
): Promise<FrontComponentManifest[]> => {
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
};

export const validateFrontComponents = (
  components: FrontComponentManifest[],
  errors: ValidationError[],
): void => {
  for (const component of components) {
    const componentPath = `front-components/${component.name ?? component.componentName ?? 'unknown'}`;

    if (!component.universalIdentifier) {
      errors.push({
        path: componentPath,
        message: 'Front component must have a universalIdentifier',
      });
    }
  }
};

export const displayFrontComponents = (components: FrontComponentManifest[]): void => {
  console.log(chalk.green(`  ✓ Found ${components.length} front component(s)`));

  if (components.length > 0) {
    console.log(chalk.gray(`  📍 Front component entry points:`));
    for (const component of components) {
      const name = component.name || component.universalIdentifier;
      console.log(chalk.gray(`     - ${name} (${component.componentPath})`));
    }
  }
};

export const collectFrontComponentIds = (
  components: FrontComponentManifest[],
): Array<{ id: string; location: string }> => {
  const ids: Array<{ id: string; location: string }> = [];

  for (const component of components) {
    if (component.universalIdentifier) {
      ids.push({
        id: component.universalIdentifier,
        location: `front-components/${component.name ?? component.componentName}`,
      });
    }
  }

  return ids;
};
