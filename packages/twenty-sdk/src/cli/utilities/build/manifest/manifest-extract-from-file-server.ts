import * as fs from 'fs-extra';
import path from 'path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { createServer, type ViteDevServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export type ExtractManifestOptions = {
  entryProperty?: string;
};

export class ManifestExtractFromFileServer {
  private server: ViteDevServer | null = null;
  private appPath: string | null = null;

  init(appPath: string): void {
    if (this.appPath !== appPath) {
      this.closeViteServer();
    }
    this.appPath = appPath;
  }

  async extractManifestFromFile<TManifest>(
    filepath: string,
    options: ExtractManifestOptions = {},
  ): Promise<TManifest> {
    if (!this.appPath) {
      throw new Error('ManifestExtractFromFileServer not initialized. Call init(appPath) first.');
    }

    const { entryProperty } = options;
    const server = await this.getServer();
    const module = (await server.ssrLoadModule(filepath)) as Record<string, unknown>;

    const config = this.extractConfigFromModule<Record<string, unknown>>(module, entryProperty);

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
      throw new Error(`${entryProperty} function in ${filepath} must be a named function`);
    }

    const importSource = await this.resolveEntryPath(filepath, entryName);
    const entryPath = importSource ?? path.relative(this.appPath, filepath).replace(/\\/g, '/');

    const { [entryProperty]: _, ...configWithoutEntry } = config;

    return {
      ...configWithoutEntry,
      [`${entryProperty}Name`]: entryName,
      [`${entryProperty}Path`]: entryPath,
    } as TManifest;
  }

  async closeViteServer(): Promise<void> {
    if (this.server) {
      await this.server.close();
      this.server = null;
    }
  }

  private async getServer(): Promise<ViteDevServer> {
    if (!this.appPath) {
      throw new Error('ManifestExtractFromFileServer not initialized. Call init(appPath) first.');
    }

    if (this.server) {
      return this.server;
    }

    this.server = await createServer({
      root: this.appPath,
      plugins: [tsconfigPaths({ root: this.appPath })],
      server: { middlewareMode: true },
      optimizeDeps: { disabled: true },
      logLevel: 'silent',
      configFile: false,
      esbuild: { jsx: 'automatic' },
    });

    return this.server;
  }

  private extractConfigFromModule<T>(
    module: Record<string, unknown>,
    entryProperty?: string,
  ): T | undefined {
    const hasValidEntry = (value: unknown): boolean =>
      isPlainObject(value) &&
      typeof (value as Record<string, unknown>)[entryProperty!] === 'function';

    if (isDefined(module.default) && (!entryProperty || hasValidEntry(module.default))) {
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
      new RegExp(`import\\s*\\{[^}]*\\b${entryName}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`),
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

    const server = await this.getServer();
    const resolved = await server.pluginContainer.resolveId(importSpecifier, filepath);
    if (resolved?.id) {
      return path.relative(this.appPath, resolved.id).replace(/\\/g, '/');
    }

    if (importSpecifier.startsWith('.')) {
      const absolutePath = path.resolve(path.dirname(filepath), importSpecifier);
      const relativePath = path.relative(this.appPath, absolutePath);
      return (relativePath.endsWith('.ts') ? relativePath : `${relativePath}.ts`).replace(/\\/g, '/');
    }

    return null;
  }
}

export const manifestExtractFromFileServer = new ManifestExtractFromFileServer();
