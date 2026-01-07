import { createJiti } from 'jiti';
import { fileURLToPath } from 'node:url';

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
      throw new Error(`Failed to load config from ${filepath}: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Load a function module that exports both config and handler.
 *
 * @example
 * ```typescript
 * const { config, handlerName } = await loadFunctionModule('/path/to/app/functions/my-function.function.ts');
 * ```
 */
export const loadFunctionModule = async (
  filepath: string,
): Promise<{
  config: unknown;
  handlerName: string;
}> => {
  const jiti = createConfigLoader();

  try {
    const mod = (await jiti.import(filepath)) as Record<string, unknown>;

    // Find the config export
    const config = mod.config;
    if (!config) {
      throw new Error(`Function file ${filepath} must export a "config" object`);
    }

    // Find the handler (default export or any exported function that's not config)
    let handlerName: string | undefined;

    if (typeof mod.default === 'function') {
      handlerName = 'default';
    } else {
      // Look for other exported functions
      for (const [key, value] of Object.entries(mod)) {
        if (key !== 'config' && typeof value === 'function') {
          handlerName = key;
          break;
        }
      }
    }

    if (!handlerName) {
      throw new Error(
        `Function file ${filepath} must export a handler function (either as default or named export)`,
      );
    }

    return { config, handlerName };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load function module from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};
