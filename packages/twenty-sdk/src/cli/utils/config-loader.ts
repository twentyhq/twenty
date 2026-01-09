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
 * Find the first valid config export from a module.
 * Priority:
 * 1. default export
 * 2. first named export that is a plain object (not a function, class, or primitive)
 */
const findConfigExport = <T>(
  mod: Record<string, unknown>,
  validator?: (value: unknown) => boolean,
): T | undefined => {
  // Priority 1: default export
  if (mod.default !== undefined) {
    if (!validator || validator(mod.default)) {
      return mod.default as T;
    }
  }

  // Priority 2: first named export that passes validation (or is a plain object)
  for (const [key, value] of Object.entries(mod)) {
    if (key === 'default') continue;
    if (value === undefined || value === null) continue;

    // Skip functions, classes, and primitives - we want config objects
    if (typeof value !== 'object') continue;

    // Skip arrays
    if (Array.isArray(value)) continue;

    if (!validator || validator(value)) {
      return value as T;
    }
  }

  return undefined;
};

/**
 * Load a TypeScript config file using jiti runtime evaluation.
 * This allows importing constants and other modules in config files.
 *
 * Supports multiple export patterns:
 * - `export default { ... }`
 * - `export const anyName = { ... }` (any named export that is a plain object)
 *
 * @example
 * ```typescript
 * const config = await loadConfig<AppDefinition>('/path/to/app/application.config.ts');
 * ```
 */
export const loadConfig = async <T>(filepath: string): Promise<T> => {
  const jiti = createConfigLoader();

  try {
    const mod = (await jiti.import(filepath)) as Record<string, unknown>;

    const config = findConfigExport<T>(mod);

    if (!config) {
      throw new Error(
        `Config file ${filepath} must export a config object (default export or any named object export)`,
      );
    }

    return config;
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
 * Escape special regex characters in a string.
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  // Escape special regex characters in the identifier (e.g., $ in function names like $handler)
  const escapedIdentifier = escapeRegExp(identifier);

  // Match: import { identifier } from 'path'
  // Match: import { original as identifier } from 'path'
  // Match: import identifier from 'path' (default import)
  const patterns = [
    // Named import: import { foo } from 'path' or import { foo, bar } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\b${escapedIdentifier}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Aliased import: import { original as foo } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\w+\\s+as\\s+${escapedIdentifier}[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Default import: import foo from 'path'
    new RegExp(`import\\s+${escapedIdentifier}\\s+from\\s*['"]([^'"]+)['"]`),
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
      const resultPath = relativePath.endsWith('.ts')
        ? relativePath
        : `${relativePath}.ts`;

      return resultPath.replace(/\\/g, '/');
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

    // Find config with a handler property
    const hasHandler = (value: unknown): boolean => {
      return (
        typeof value === 'object' &&
        value !== null &&
        'handler' in value &&
        typeof (value as { handler: unknown }).handler === 'function'
      );
    };

    const config = findConfigExport<{ handler: Function }>(mod, hasHandler);

    if (!config) {
      throw new Error(
        `Function file ${filepath} must export a config object with a "handler" property`,
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
