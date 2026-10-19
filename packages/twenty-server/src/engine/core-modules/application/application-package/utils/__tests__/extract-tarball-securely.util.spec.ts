import { randomBytes } from 'crypto';
import fs from 'fs';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import * as tar from 'tar';

import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { extractTarballSecurely } from 'src/engine/core-modules/application/application-package/utils/extract-tarball-securely.util';

const MAX_EXTRACTED_SIZE_BYTES_FOR_TEST = 1024;

describe('extractTarballSecurely', () => {
  let workDir: string;
  let targetDir: string;

  const createTarball = async (files: Record<string, string | Buffer>) => {
    const sourceDir = path.join(workDir, 'source');

    await mkdir(sourceDir);

    for (const [fileName, content] of Object.entries(files)) {
      await writeFile(path.join(sourceDir, fileName), content);
    }

    const tarballPath = path.join(workDir, 'package.tgz');

    await tar.create(
      { gzip: true, file: tarballPath, cwd: sourceDir },
      Object.keys(files),
    );

    return tarballPath;
  };

  beforeAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'extract-tarball-securely-'));
    targetDir = path.join(workDir, 'target');

    await mkdir(targetDir);
  });

  afterEach(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  it('should extract a tarball under the size limit', async () => {
    const tarballPath = await createTarball({
      'package.json': '{"name":"app"}',
    });

    await extractTarballSecurely({
      tarballPath,
      targetDir,
      maxExtractedSizeBytes: MAX_EXTRACTED_SIZE_BYTES_FOR_TEST,
    });

    await expect(
      readFile(path.join(targetDir, 'package.json'), 'utf8'),
    ).resolves.toBe('{"name":"app"}');
  });

  it('should reject when the extracted size exceeds the limit', async () => {
    const tarballPath = await createTarball({
      'large.txt': 'a'.repeat(MAX_EXTRACTED_SIZE_BYTES_FOR_TEST * 2),
    });

    await expect(
      extractTarballSecurely({
        tarballPath,
        targetDir,
        maxExtractedSizeBytes: MAX_EXTRACTED_SIZE_BYTES_FOR_TEST,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
    });
  });

  it('should stop reading the tarball once the limit is exceeded', async () => {
    const tarballPath = await createTarball({
      'large.txt': 'a'.repeat(MAX_EXTRACTED_SIZE_BYTES_FOR_TEST * 2),
      'incompressible.bin': randomBytes(4 * 1024 * 1024),
    });
    const createReadStreamSpy = jest.spyOn(fs, 'createReadStream');

    await expect(
      extractTarballSecurely({
        tarballPath,
        targetDir,
        maxExtractedSizeBytes: MAX_EXTRACTED_SIZE_BYTES_FOR_TEST,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.TARBALL_EXTRACTION_FAILED,
    });

    const tarballStream = createReadStreamSpy.mock.results[0]
      .value as fs.ReadStream;
    const { size: tarballSize } = await stat(tarballPath);

    expect(tarballStream.bytesRead).toBeLessThan(tarballSize);

    createReadStreamSpy.mockRestore();
  });
});
