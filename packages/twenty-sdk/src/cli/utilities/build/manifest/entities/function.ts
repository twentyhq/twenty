import { glob } from 'fast-glob';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { type ValidationError } from '@/cli/utilities/build/manifest/manifest-types';
import {
  type EntityBuildResult,
  type EntityIdWithLocation,
  type ManifestEntityBuilder,
  type ManifestWithoutSources,
} from '@/cli/utilities/build/manifest/entities/entity-interface';

type ExtractedFunctionManifest = Omit<
  LogicFunctionManifest,
  'sourceHandlerPath' | 'builtHandlerPath' | 'builtHandlerChecksum'
> & {
  handler: string;
};

export class FunctionEntityBuilder
  implements ManifestEntityBuilder<LogicFunctionManifest>
{
  async build(
    appPath: string,
  ): Promise<EntityBuildResult<LogicFunctionManifest>> {
    const functionFiles = await glob(['**/*.function.ts'], {
      cwd: appPath,
      ignore: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.twenty/**',
      ],
    });

    const manifests: LogicFunctionManifest[] = [];

    for (const filePath of functionFiles) {
      try {
        const absolutePath = `${appPath}/${filePath}`;

        const { manifest, exportName } =
          await manifestExtractFromFileServer.extractManifestFromFile<ExtractedFunctionManifest>(
            absolutePath,
          );

        const { handler: _, ...rest } = manifest;
        // builtHandlerPath is computed from filePath (the .function.ts file)
        // since that's what esbuild actually builds, not handlerPath
        const builtHandlerPath = this.computeBuiltHandlerPath(filePath);

        // For default exports, use 'default.handler'
        // For named exports like 'export const anyName = ...', use 'anyName.handler'
        const handlerName =
          exportName !== null ? `${exportName}.handler` : 'default.handler';

        manifests.push({
          ...rest,
          handlerName,
          sourceHandlerPath: filePath,
          builtHandlerPath,
          builtHandlerChecksum: null,
        });
      } catch (error) {
        throw new Error(
          `Failed to load function from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return { manifests, filePaths: functionFiles };
  }

  private computeBuiltHandlerPath(sourceHandlerPath: string): string {
    return sourceHandlerPath.replace(/\.tsx?$/, '.mjs');
  }

  validate(
    functions: LogicFunctionManifest[],
    errors: ValidationError[],
  ): void {
    for (const fn of functions) {
      const fnPath = `functions/${fn.name ?? fn.handlerName ?? 'unknown'}`;

      if (!fn.universalIdentifier) {
        errors.push({
          path: fnPath,
          message: 'Function must have a universalIdentifier',
        });
      }

      for (const trigger of fn.triggers ?? []) {
        const triggerPath = `${fnPath}.triggers.${trigger.type ?? 'unknown'}`;

        if (!trigger.universalIdentifier) {
          errors.push({
            path: triggerPath,
            message: 'Trigger must have a universalIdentifier',
          });
        }

        if (!trigger.type) {
          errors.push({
            path: triggerPath,
            message: 'Trigger must have a type',
          });
          continue;
        }

        switch (trigger.type) {
          case 'route':
            if (!trigger.path) {
              errors.push({
                path: triggerPath,
                message: 'Route trigger must have a path',
              });
            }
            if (!trigger.httpMethod) {
              errors.push({
                path: triggerPath,
                message: 'Route trigger must have an httpMethod',
              });
            }
            break;

          case 'cron':
            if (!trigger.pattern) {
              errors.push({
                path: triggerPath,
                message: 'Cron trigger must have a pattern',
              });
            }
            break;

          case 'databaseEvent':
            if (!trigger.eventName) {
              errors.push({
                path: triggerPath,
                message: 'Database event trigger must have an eventName',
              });
            }
            break;
        }
      }
    }
  }

  findDuplicates(manifest: ManifestWithoutSources): EntityIdWithLocation[] {
    const seen = new Map<string, string[]>();
    const functions = manifest.functions ?? [];

    for (const fn of functions) {
      if (fn.universalIdentifier) {
        const location = `functions/${fn.name ?? fn.handlerName}`;
        const locations = seen.get(fn.universalIdentifier) ?? [];
        locations.push(location);
        seen.set(fn.universalIdentifier, locations);
      }
      for (const trigger of fn.triggers ?? []) {
        if (trigger.universalIdentifier) {
          const location = `functions/${fn.name ?? fn.handlerName}.triggers.${trigger.type}`;
          const locations = seen.get(trigger.universalIdentifier) ?? [];
          locations.push(location);
          seen.set(trigger.universalIdentifier, locations);
        }
      }
    }

    return Array.from(seen.entries())
      .filter(([_, locations]) => locations.length > 1)
      .map(([id, locations]) => ({ id, locations }));
  }
}

export const functionEntityBuilder = new FunctionEntityBuilder();
