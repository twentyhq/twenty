import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import { createRequire } from 'module';
import * as os from 'os';
import path from 'path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export class ManifestExtractFromFileServer {
  private appPath: string | null = null;

  init(appPath: string): void {
    this.appPath = appPath;
  }

  async extractManifestFromFile<TManifest>(
    filepath: string,
  ): Promise<TManifest> {
    if (!this.appPath) {
      throw new Error(
        'ManifestExtractFromFileServer not initialized. Call init(appPath) first.',
      );
    }

    const module = await this.loadModule(filepath);

    const config = this.extractConfigFromModule<TManifest>(module);

    if (!config) {
      throw new Error(
        `Config file ${filepath} must export a config object (default export or any named object export)`,
      );
    }

    return config;
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
  ): T | undefined {
    if (isDefined(module.default) && isPlainObject(module.default)) {
      return module.default as T;
    }

    for (const value of Object.values(module)) {
      if (isPlainObject(value)) {
        return value as T;
      }
    }

    return undefined;
  }
}

export const manifestExtractFromFileServer =
  new ManifestExtractFromFileServer();
