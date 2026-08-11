import { MINIMAL_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { enumerateSharedDependenciesExportNames } from '@/cli/utilities/build/common/shared-dependencies-build/utils/enumerate-shared-dependencies-export-names';

describe('enumerateSharedDependenciesExportNames', () => {
  it('reports the named exports and the default of a commonjs dependency', async () => {
    const exportNames = await enumerateSharedDependenciesExportNames({
      appPath: MINIMAL_APP_PATH,
      specifier: 'react',
    });

    expect(exportNames.namedExports).toContain('useState');
    expect(exportNames.namedExports).not.toContain('default');
    expect(exportNames.hasDefaultExport).toBe(true);
  }, 60000);

  it('reports the default of an es module that declares one', async () => {
    const exportNames = await enumerateSharedDependenciesExportNames({
      appPath: MINIMAL_APP_PATH,
      specifier: 'axios',
    });

    expect(exportNames.namedExports).toContain('isAxiosError');
    expect(exportNames.hasDefaultExport).toBe(true);
  }, 60000);

  it('reports no default for an es module without one', async () => {
    const exportNames = await enumerateSharedDependenciesExportNames({
      appPath: MINIMAL_APP_PATH,
      specifier: '@remote-dom/core',
    });

    expect(exportNames.namedExports).toContain('ROOT_ID');
    expect(exportNames.hasDefaultExport).toBe(false);
  }, 60000);

  it('throws for a dependency the application cannot resolve', async () => {
    await expect(
      enumerateSharedDependenciesExportNames({
        appPath: MINIMAL_APP_PATH,
        specifier: 'this-package-does-not-exist',
      }),
    ).rejects.toThrow('Unable to determine the exports');
  }, 60000);
});
