import { ensureDir, pathExists } from '@/cli/utilities/file/fs-utils';
import archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import path from 'path';

/**
 * TarballService creates distributable .tar.gz archives from built applications.
 */
export class TarballService {
  /**
   * Create a tarball from the build output directory.
   *
   * @param sourceDir - The directory containing built files
   * @param outputPath - The path for the output .tar.gz file
   * @returns The absolute path to the created tarball
   */
  async create(options: {
    sourceDir: string;
    outputPath: string;
  }): Promise<string> {
    const { sourceDir, outputPath } = options;

    // Ensure the source directory exists
    if (!(await pathExists(sourceDir))) {
      throw new Error(`Source directory does not exist: ${sourceDir}`);
    }

    // Ensure the output directory exists
    await ensureDir(path.dirname(outputPath));

    // Normalize the output path to have .tar.gz extension
    const normalizedOutputPath = outputPath.endsWith('.tar.gz')
      ? outputPath
      : `${outputPath}.tar.gz`;

    return new Promise((resolve, reject) => {
      const output = createWriteStream(normalizedOutputPath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: 9 }, // Maximum compression
      });

      output.on('close', () => {
        resolve(normalizedOutputPath);
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });

      archive.on('warning', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          // Log warnings about missing files
          console.warn('Archive warning:', err.message);
        } else {
          reject(err);
        }
      });

      archive.pipe(output);

      // Add the entire source directory to the archive
      archive.directory(sourceDir, false);

      archive.finalize();
    });
  }
}
