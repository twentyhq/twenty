import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import { createRequire } from 'module';
import * as os from 'os';
import path from 'path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export type ExtractManifestOptions = {
  entryProperty?: string;
};

export class ManifestExtractFromFileServer {
  private appPath: string | null = null;

  init(appPath: string): void {
    this.appPath = appPath;
  }

  async extractManifestFromFile<TManifest>(
    filepath: string,
    options: ExtractManifestOptions = {},
  ): Promise<TManifest> {
    if (!this.appPath) {
      throw new Error(
        'ManifestExtractFromFileServer not initialized. Call init(appPath) first.',
      );
    }

    const { entryProperty } = options;
    const module = await this.loadModule(filepath);

    const config = this.extractConfigFromModule<Record<string, unknown>>(
      module,
      entryProperty,
    );

    if (!config) {
      const expectedExport = entryProperty
        ? `a config object with a "${entryProperty}" property`
        : 'a config object (default export or any named object export)';
      throw new Error(`Config file ${filepath} must export ${expectedExport}`);
    }

    if (!entryProperty) {
      return config as TManifest;
    }

    const entryFunction = config[entryProperty] as Function;
    const entryName = entryFunction.name;

    if (!entryName) {
      throw new Error(
        `${entryProperty} function in ${filepath} must be a named function`,
      );
    }

    const importSource = await this.resolveEntryPath(filepath, entryName);
    const entryPath =
      importSource ?? path.relative(this.appPath, filepath).replace(/\\/g, '/');

    const { [entryProperty]: _, ...configWithoutEntry } = config;

    return {
      ...configWithoutEntry,
      [`${entryProperty}Name`]: entryName,
      [`${entryProperty}Path`]: entryPath,
    } as TManifest;
  }

  private async loadModule(filepath: string): Promise<Record<string, unknown>> {
    if (!this.appPath) {
      throw new Error(
        'ManifestExtractFromFileServer not initialized. Call init(appPath) first.',
      );
    }

    const tsconfigPath = path.join(this.appPath, 'tsconfig.json');
    const hasTsconfig = await fs.pathExists(tsconfigPath);

    // Resolve react from the app's node_modules for the alias
    const appRequire = createRequire(path.join(this.appPath, 'package.json'));
    let reactPath: string | undefined;
    let reactDomPath: string | undefined;

    try {
      reactPath = path.dirname(appRequire.resolve('react/package.json'));
      reactDomPath = path.dirname(appRequire.resolve('react-dom/package.json'));
    } catch {
      // React not installed in app, will be bundled if used
    }

    const result = await esbuild.build({
      entryPoints: [filepath],
      bundle: true,
      write: false,
      format: 'cjs',
      platform: 'node',
      target: 'node18',
      jsx: 'automatic',
      tsconfig: hasTsconfig ? tsconfigPath : undefined,
      // Use alias to resolve react from app's node_modules
      alias: {
        ...(reactPath && { react: reactPath }),
        ...(reactDomPath && { 'react-dom': reactDomPath }),
      },
      logLevel: 'silent',
    });

    const code = result.outputFiles[0].text;

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'twenty-manifest-'),
    );
    const tempFile = path.join(tempDir, 'module.cjs');

    try {
      await fs.writeFile(tempFile, code);

      return require(tempFile) as Record<string, unknown>;
    } finally {
      await fs.remove(tempDir);
    }
  }

  private extractConfigFromModule<T>(
    module: Record<string, unknown>,
    entryProperty?: string,
  ): T | undefined {
    const hasValidEntry = (value: unknown): boolean =>
      isPlainObject(value) &&
      typeof (value as Record<string, unknown>)[entryProperty!] === 'function';

    if (
      isDefined(module.default) &&
      (!entryProperty || hasValidEntry(module.default))
    ) {
      return module.default as T;
    }

    for (const value of Object.values(module)) {
      if (isPlainObject(value) && (!entryProperty || hasValidEntry(value))) {
        return value as T;
      }
    }

    return undefined;
  }

  private async resolveEntryPath(
    filepath: string,
    entryName: string,
  ): Promise<string | null> {
    if (!this.appPath) {
      return null;
    }

    const source = await fs.readFile(filepath, 'utf8');

    const patterns = [
      new RegExp(
        `import\\s*\\{[^}]*\\b${entryName}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
      ),
      new RegExp(`import\\s+${entryName}\\s+from\\s*['"]([^'"]+)['"]`),
    ];

    let importSpecifier: string | null = null;
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match) {
        importSpecifier = match[1];
        break;
      }
    }

    if (!importSpecifier) {
      return null;
    }

    const resolveDir = path.dirname(filepath);
    const tsconfigPath = path.join(this.appPath, 'tsconfig.json');
    const hasTsconfig = await fs.pathExists(tsconfigPath);

    try {
      const result = await esbuild.build({
        stdin: {
          contents: `import "${importSpecifier}"`,
          resolveDir,
          loader: 'ts',
        },
        bundle: true,
        write: false,
        metafile: true,
        platform: 'node',
        logLevel: 'silent',
        tsconfig: hasTsconfig ? tsconfigPath : undefined,
        external: ['*'],
        plugins: [
          {
            name: 'resolve-capture',
            setup: (build) => {
              build.onResolve({ filter: /.*/ }, async (args) => {
                if (args.kind === 'entry-point') {
                  return undefined;
                }
                const resolved = await build.resolve(args.path, {
                  kind: args.kind,
                  resolveDir: args.resolveDir,
                  importer: args.importer,
                });
                return { path: resolved.path, external: true };
              });
            },
          },
        ],
      });

      const inputs = Object.keys(result.metafile?.inputs ?? {});
      const resolvedPath = inputs.find((input) => input !== '<stdin>');

      if (resolvedPath) {
        return path.relative(this.appPath, resolvedPath).replace(/\\/g, '/');
      }
    } catch {
      // Fallback to manual resolution
    }

    if (importSpecifier.startsWith('.')) {
      const absolutePath = path.resolve(
        path.dirname(filepath),
        importSpecifier,
      );
      const relativePath = path.relative(this.appPath, absolutePath);
      return (
        relativePath.endsWith('.ts') ? relativePath : `${relativePath}.ts`
      ).replace(/\\/g, '/');
    }

    return null;
  }
}

export const manifestExtractFromFileServer =
  new ManifestExtractFromFileServer();
