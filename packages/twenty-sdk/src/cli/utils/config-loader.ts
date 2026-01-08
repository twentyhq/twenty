import { createJiti } from 'jiti';
import * as fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Create a jiti instance for loading TypeScript config files
const createConfigLoader = () => {
  return createJiti(fileURLToPath(import.meta.url), {
    moduleCache: false, // Don't cache during dev for hot reload
    fsCache: false,
    interopDefault: true,
  });
};

/**
 * Load a TypeScript config file using jiti runtime evaluation.
 * This allows importing constants and other modules in config files.
 *
 * @example
 * ```typescript
 * const config = await loadConfig<AppDefinition>('/path/to/app/application.config.ts');
 * ```
 */
export const loadConfig = async <T>(filepath: string): Promise<T> => {
  const jiti = createConfigLoader();

  try {
    const mod = (await jiti.import(filepath)) as {
      default?: T;
      config?: T;
      [key: string]: unknown;
    };

    // Support both `export default` and `export const config`
    const config = mod.default ?? mod.config;

    if (!config) {
      throw new Error(
        `Config file ${filepath} must export a default value or a "config" named export`,
      );
    }

    return config as T;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load config from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};

/**
 * Extract the import path for a given identifier from source code.
 * Returns null if the identifier is not imported (i.e., defined locally).
 */
const extractImportPath = (
  source: string,
  identifier: string,
  filepath: string,
  appPath: string,
): string | null => {
  // Match: import { identifier } from 'path'
  // Match: import { original as identifier } from 'path'
  // Match: import identifier from 'path' (default import)
  const patterns = [
    // Named import: import { foo } from 'path' or import { foo, bar } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\b${identifier}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Aliased import: import { original as foo } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\w+\\s+as\\s+${identifier}[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Default import: import foo from 'path'
    new RegExp(`import\\s+${identifier}\\s+from\\s*['"]([^'"]+)['"]`),
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);

    if (match) {
      const importPath = match[1];
      // Resolve relative to the function file, then make relative to appPath
      const fileDir = path.dirname(filepath);
      const absolutePath = path.resolve(fileDir, importPath);
      const relativePath = path.relative(appPath, absolutePath);

      // Add .ts extension if not present
      return relativePath.endsWith('.ts') ? relativePath : `${relativePath}.ts`;
    }
  }

  // Handler is defined locally, not imported
  return null;
};

/**
 * Load a function module and extract handler info from config.handler property.
 *
 * The handler can be either:
 * 1. Imported from another file:
 *    ```typescript
 *    import { myHandler } from '../src/handlers/my-handler';
 *    export const config = { handler: myHandler, ... };
 *    ```
 *
 * 2. Defined locally in the same file:
 *    ```typescript
 *    export const myHandler = async () => { ... };
 *    export const config = { handler: myHandler, ... };
 *    ```
 *
 * @example
 * ```typescript
 * const { config, handlerName, handlerPath } = await loadFunctionModule(
 *   '/path/to/app/functions/my-function.function.ts',
 *   '/path/to/app'
 * );
 * ```
 */
export const loadFunctionModule = async (
  filepath: string,
  appPath: string,
): Promise<{
  config: unknown;
  handlerName: string;
  handlerPath: string;
}> => {
  const jiti = createConfigLoader();

  try {
    const mod = (await jiti.import(filepath)) as Record<string, unknown>;

    const config = (mod.default ?? mod.config) as
      | { handler: Function }
      | undefined;

    if (!config) {
      throw new Error(
        `Function file ${filepath} must export a "config" object`,
      );
    }

    if (typeof config.handler !== 'function') {
      throw new Error(
        `Function config in ${filepath} must have a "handler" property referencing a function`,
      );
    }

    // Get handler name from the function's name property
    const handlerName = config.handler.name;

    if (!handlerName) {
      throw new Error(
        `Handler function in ${filepath} must be a named function`,
      );
    }

    // Parse source to find where the handler is imported from
    const source = await fs.readFile(filepath, 'utf8');
    const importPath = extractImportPath(
      source,
      handlerName,
      filepath,
      appPath,
    );

    // If handler is imported, use the import path; otherwise use the function file itself
    const handlerPath =
      importPath ?? path.relative(appPath, filepath).replace(/\\/g, '/');

    return { config, handlerName, handlerPath };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load function module from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};
