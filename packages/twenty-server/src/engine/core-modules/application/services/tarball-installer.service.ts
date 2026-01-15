import { Injectable } from '@nestjs/common';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { extract } from 'tar-fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';

import { ApplicationManifest, PackageJson } from 'twenty-shared/application';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const TARBALL_ROOT_DIR = 'twenty-app';
const MAX_TARBALL_SIZE = 50 * 1024 * 1024; // 50MB
const DOWNLOAD_TIMEOUT = 60000; // 60 seconds

export type ExtractedApplication = {
  manifest: ApplicationManifest;
  packageJson: PackageJson;
  yarnLock: string;
};

@Injectable()
export class TarballInstallerService {
  /**
   * Download and extract a tarball from a URL, returning the application data.
   */
  async installFromUrl(url: string): Promise<ExtractedApplication> {
    // Validate URL
    this.validateUrl(url);

    const tempDir = path.join(os.tmpdir(), `twenty-install-${Date.now()}`);
    const tarballPath = path.join(tempDir, 'app.tar.gz');

    try {
      await fs.ensureDir(tempDir);

      // Download tarball
      await this.downloadTarball(url, tarballPath);

      // Extract and parse
      return await this.extractAndParse(tarballPath, tempDir);
    } finally {
      // Clean up temp files
      await fs.remove(tempDir).catch(() => {});
    }
  }

  /**
   * Extract and parse a local tarball file.
   */
  async installFromFile(tarballPath: string): Promise<ExtractedApplication> {
    if (!(await fs.pathExists(tarballPath))) {
      throw new ApplicationException(
        `Tarball file not found: ${tarballPath}`,
        ApplicationExceptionCode.FILE_NOT_FOUND,
      );
    }

    const tempDir = path.join(os.tmpdir(), `twenty-extract-${Date.now()}`);

    try {
      await fs.ensureDir(tempDir);
      return await this.extractAndParse(tarballPath, tempDir);
    } finally {
      await fs.remove(tempDir).catch(() => {});
    }
  }

  /**
   * Validate the URL for security.
   */
  private validateUrl(url: string): void {
    try {
      const parsedUrl = new URL(url);

      // Only allow HTTPS
      if (parsedUrl.protocol !== 'https:') {
        throw new ApplicationException(
          'Only HTTPS URLs are allowed for security reasons',
          ApplicationExceptionCode.INVALID_URL,
        );
      }

      // Block private/internal IPs
      const hostname = parsedUrl.hostname.toLowerCase();
      const blockedPatterns = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '10.',
        '192.168.',
        '172.16.',
        '172.17.',
        '172.18.',
        '172.19.',
        '172.20.',
        '172.21.',
        '172.22.',
        '172.23.',
        '172.24.',
        '172.25.',
        '172.26.',
        '172.27.',
        '172.28.',
        '172.29.',
        '172.30.',
        '172.31.',
        '169.254.',
        '[::1]',
        'metadata.google',
        '169.254.169.254',
      ];

      for (const pattern of blockedPatterns) {
        if (hostname.includes(pattern)) {
          throw new ApplicationException(
            'URL points to a blocked address',
            ApplicationExceptionCode.INVALID_URL,
          );
        }
      }
    } catch (error) {
      if (error instanceof ApplicationException) {
        throw error;
      }
      throw new ApplicationException(
        `Invalid URL: ${url}`,
        ApplicationExceptionCode.INVALID_URL,
      );
    }
  }

  /**
   * Download a tarball from URL to local file.
   */
  private async downloadTarball(url: string, destPath: string): Promise<void> {
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: DOWNLOAD_TIMEOUT,
        maxContentLength: MAX_TARBALL_SIZE,
        maxBodyLength: MAX_TARBALL_SIZE,
        headers: {
          Accept: 'application/gzip, application/x-gzip, application/x-tar',
        },
      });

      // Check content length if provided
      const contentLength = response.headers['content-length'];

      if (contentLength && parseInt(contentLength, 10) > MAX_TARBALL_SIZE) {
        throw new ApplicationException(
          `Tarball exceeds maximum size of ${MAX_TARBALL_SIZE / 1024 / 1024}MB`,
          ApplicationExceptionCode.TARBALL_TOO_LARGE,
        );
      }

      const writer = fs.createWriteStream(destPath);

      await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Verify file size after download
      const stats = await fs.stat(destPath);

      if (stats.size > MAX_TARBALL_SIZE) {
        throw new ApplicationException(
          `Tarball exceeds maximum size of ${MAX_TARBALL_SIZE / 1024 / 1024}MB`,
          ApplicationExceptionCode.TARBALL_TOO_LARGE,
        );
      }
    } catch (error) {
      if (error instanceof ApplicationException) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new ApplicationException(
            `Tarball not found at URL: ${url}`,
            ApplicationExceptionCode.FILE_NOT_FOUND,
          );
        }
        throw new ApplicationException(
          `Failed to download tarball: ${error.message}`,
          ApplicationExceptionCode.DOWNLOAD_FAILED,
        );
      }

      throw new ApplicationException(
        `Failed to download tarball: ${error instanceof Error ? error.message : String(error)}`,
        ApplicationExceptionCode.DOWNLOAD_FAILED,
      );
    }
  }

  /**
   * Extract tarball and parse the application data.
   */
  private async extractAndParse(
    tarballPath: string,
    tempDir: string,
  ): Promise<ExtractedApplication> {
    const extractDir = path.join(tempDir, 'extracted');

    await fs.ensureDir(extractDir);

    // Extract tarball
    const inputStream = fs.createReadStream(tarballPath);
    const gunzipStream = createGunzip();
    const extractStream = extract(extractDir);

    await pipeline(inputStream, gunzipStream, extractStream);

    // Find the app directory (should be twenty-app/)
    const appDir = path.join(extractDir, TARBALL_ROOT_DIR);

    if (!(await fs.pathExists(appDir))) {
      throw new ApplicationException(
        `Invalid tarball structure: missing ${TARBALL_ROOT_DIR} directory`,
        ApplicationExceptionCode.INVALID_TARBALL_STRUCTURE,
      );
    }

    // Load manifest
    const manifestPath = path.join(appDir, 'manifest.json');

    if (!(await fs.pathExists(manifestPath))) {
      throw new ApplicationException(
        'Invalid tarball: missing manifest.json',
        ApplicationExceptionCode.INVALID_TARBALL_STRUCTURE,
      );
    }

    const manifest = (await fs.readJson(manifestPath)) as ApplicationManifest;

    // Validate manifest structure
    this.validateManifest(manifest);

    // Load package.json
    const packageJsonPath = path.join(appDir, 'package.json');
    let packageJson: PackageJson = {
      name: 'unknown',
      version: '0.0.0',
      license: 'UNLICENSED',
      engines: { node: '>=18.0.0', npm: 'please-use-yarn', yarn: '>=4.0.0' },
      packageManager: 'yarn@4.0.0',
    };

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    // Load yarn.lock
    const yarnLockPath = path.join(appDir, 'yarn.lock');
    let yarnLock = '';

    if (await fs.pathExists(yarnLockPath)) {
      yarnLock = await fs.readFile(yarnLockPath, 'utf8');
    }

    return { manifest, packageJson, yarnLock };
  }

  /**
   * Validate the manifest has required fields.
   */
  private validateManifest(manifest: ApplicationManifest): void {
    if (!manifest.application) {
      throw new ApplicationException(
        'Invalid manifest: missing application field',
        ApplicationExceptionCode.INVALID_MANIFEST,
      );
    }

    if (!manifest.application.universalIdentifier) {
      throw new ApplicationException(
        'Invalid manifest: missing application.universalIdentifier',
        ApplicationExceptionCode.INVALID_MANIFEST,
      );
    }

    if (!manifest.sources) {
      throw new ApplicationException(
        'Invalid manifest: missing sources field',
        ApplicationExceptionCode.INVALID_MANIFEST,
      );
    }
  }
}
