import * as fs from 'fs-extra';
import { createJiti } from 'jiti';
import { type JitiOptions } from 'jiti/lib/types';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseJsoncFile } from './file-jsonc';

/**
 * Read tsconfig.json paths and convert them to jiti aliases.
 * Handles patterns like "generated/*": ["./generated/*"]
 */
const getTsconfigAliases = async (
  appPath: string,
): Promise<Record<string, string>> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');

  if (!(await fs.pathExists(tsconfigPath))) {
    return {};
  }

  try {
    const tsconfig = await parseJsoncFile(tsconfigPath);
    const paths = tsconfig?.compilerOptions?.paths as
      | Record<string, string[]>
      | undefined;
    const baseUrl = (tsconfig?.compilerOptions?.baseUrl as string) || '.';

    if (!paths) {
      return {};
    }

    const aliases: Record<string, string> = {};

    for (const [pattern, targets] of Object.entries(paths)) {
      if (targets.length === 0) continue;

      // Remove trailing /* from pattern and target
      const aliasKey = pattern.replace(/\/\*$/, '');
      const targetPath = targets[0].replace(/\/\*$/, '');

      // Resolve the target path relative to baseUrl and appPath
      const resolvedTarget = path.resolve(appPath, baseUrl, targetPath);
      aliases[aliasKey] = resolvedTarget;
    }

    return aliases;
  } catch {
    return {};
  }
};

/**
 * Transform JSX/TSX files using esbuild before loading.
 */
const transformJsxFile = async (filepath: string): Promise<string> => {
  // Use esbuild for fast JSX transformation
  const esbuild = await import('esbuild');
  const source = await fs.readFile(filepath, 'utf8');

  const result = await esbuild.transform(source, {
    loader: 'tsx',
    jsx: 'automatic',
    format: 'esm',
  });

  return result.code;
};

/**
 * Create a jiti instance for loading TypeScript config files.
 * When appPath is provided, jiti will use the app's tsconfig.json for path resolution.
 */
const createConfigLoader = async (appPath?: string) => {
  const basePath = appPath ?? fileURLToPath(import.meta.url);

  const options: JitiOptions = {
    moduleCache: false, // Don't cache during dev for hot reload
    fsCache: false,
    interopDefault: true,
  };

  // If appPath is provided, read tsconfig.json and set up aliases
  if (appPath) {
    const aliases = await getTsconfigAliases(appPath);
    if (Object.keys(aliases).length > 0) {
      options.alias = aliases;
    }
  }

  return createJiti(basePath, options);
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
 * @param filepath - Absolute path to the config file
 * @param appPath - Optional app path for tsconfig.json path resolution
 *
 * @example
 * ```typescript
 * const config = await loadConfig<AppDefinition>('/path/to/src/app/application.config.ts', '/path/to/app');
 * ```
 */
export const loadConfig = async <T>(
  filepath: string,
  appPath?: string,
): Promise<T> => {
  const jiti = await createConfigLoader(appPath);

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
 *   '/path/to/src/app/functions/my-function.function.ts',
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
  const jiti = await createConfigLoader(appPath);

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

/**
 * Load a front component module and extract component info from config.component property.
 *
 * The component can be either:
 * 1. Imported from another file:
 *    ```typescript
 *    import { MyComponent } from '../src/components/my-component';
 *    export default defineFrontComponent({ component: MyComponent, ... });
 *    ```
 *
 * 2. Defined locally in the same file:
 *    ```typescript
 *    export const MyComponent = () => { ... };
 *    export default defineFrontComponent({ component: MyComponent, ... });
 *    ```
 *
 * @example
 * ```typescript
 * const { config, componentName, componentPath } = await loadFrontComponentModule(
 *   '/path/to/src/app/components/my-component.front-component.tsx',
 *   '/path/to/app'
 * );
 * ```
 */
export const loadFrontComponentModule = async (
  filepath: string,
  appPath: string,
): Promise<{
  config: unknown;
  componentName: string;
  componentPath: string;
}> => {
  // Transform JSX file using esbuild first
  const transformedCode = await transformJsxFile(filepath);

  // Write to a temp file and load it
  const tempDir = path.join(appPath, 'node_modules', '.cache', 'twenty-sdk');
  await fs.ensureDir(tempDir);
  const tempFile = path.join(tempDir, `${path.basename(filepath, '.tsx')}.mjs`);
  await fs.writeFile(tempFile, transformedCode);

  const jiti = await createConfigLoader(appPath);

  try {
    const mod = (await jiti.import(tempFile)) as Record<string, unknown>;

    // Find config with a component property
    const hasComponent = (value: unknown): boolean => {
      return (
        typeof value === 'object' &&
        value !== null &&
        'component' in value &&
        typeof (value as { component: unknown }).component === 'function'
      );
    };

    const config = findConfigExport<{ component: Function }>(mod, hasComponent);

    if (!config) {
      throw new Error(
        `Front component file ${filepath} must export a config object with a "component" property`,
      );
    }

    // Get component name from the function's name property
    const componentName = config.component.name;

    if (!componentName) {
      throw new Error(
        `Component function in ${filepath} must be a named function`,
      );
    }

    // Parse original source to find where the component is imported from
    const originalSource = await fs.readFile(filepath, 'utf8');
    const importPath = extractImportPath(
      originalSource,
      componentName,
      filepath,
      appPath,
    );

    // If component is imported, use the import path; otherwise use the original component file
    const componentPath =
      importPath ?? path.relative(appPath, filepath).replace(/\\/g, '/');

    return { config, componentName, componentPath };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load front component module from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};
