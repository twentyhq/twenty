import { access, mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';

jest.useRealTimers();

describe('TemporaryDirManager', () => {
  it('packages source files without including its output and cleans both', async () => {
    const { createZipFile } =
      await import('src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file');
    const { Open } = await import('unzipper');
    const manager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } = await manager.init();

    try {
      expect(dirname(lambdaZipPath)).not.toBe(sourceTemporaryDir);

      await writeFile(
        join(sourceTemporaryDir, 'index.mjs'),
        'export const handler = () => 42;',
      );
      await mkdir(join(sourceTemporaryDir, 'yarn-engine'));
      await writeFile(
        join(sourceTemporaryDir, 'yarn-engine/.yarnrc.yml'),
        'enableScripts: false',
      );
      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const archive = await Open.file(lambdaZipPath);
      const files = archive.files.filter((file) => file.type === 'File');

      expect(files.map((file) => file.path).sort()).toEqual([
        'index.mjs',
        'yarn-engine/.yarnrc.yml',
      ]);
      expect(
        (
          await files.find((file) => file.path === 'index.mjs')?.buffer()
        )?.toString(),
      ).toBe('export const handler = () => 42;');
    } finally {
      await manager.clean();
    }

    await expect(access(sourceTemporaryDir)).rejects.toMatchObject({
      code: 'ENOENT',
    });
    await expect(access(lambdaZipPath)).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });
});
