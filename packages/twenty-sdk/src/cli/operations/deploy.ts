import { execFileSync } from 'child_process';
import fs from 'fs';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { putFileToUploadUrl } from '@/cli/utilities/file/put-file-to-upload-url';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';

// The manifest the server registers has to describe the archive it is
// registering, so it is read out of the tarball rather than from the build
// output next to it.
const readJsonFromTarball = (
  tarballPath: string,
  filename: string,
): Record<string, unknown> => {
  for (const entry of [`package/${filename}`, filename]) {
    try {
      const content = execFileSync('tar', ['-xzOf', tarballPath, entry], {
        encoding: 'utf-8',
      });

      if (content.trim() !== '') {
        return JSON.parse(content);
      }
    } catch {
      continue;
    }
  }

  throw new Error(`${filename} not found in ${tarballPath}`);
};

export type AppDeployOptions = {
  tarballPath: string;
  remote?: string;
  serverUrl?: string;
  token?: string;
  onProgress?: (message: string) => void;
};

export type AppDeployResult = {
  id: string;
  name: string;
  universalIdentifier: string;
};

const innerAppDeploy = async (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> => {
  const { tarballPath, onProgress } = options;

  if (options.remote) {
    ConfigService.setActiveRemote(options.remote);
  }

  onProgress?.(`Uploading ${tarballPath}...`);

  const manifest = readJsonFromTarball(tarballPath, 'manifest.json');
  const packageJson = readJsonFromTarball(tarballPath, 'package.json');

  const apiService = new ApiService({
    serverUrl: options.serverUrl,
    token: options.token,
  });

  const createResult = await apiService.createApplicationTarballUpload({
    manifest,
    packageJson,
    size: fs.statSync(tarballPath).size,
  });

  if (!createResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Upload failed: ${createResult.error}`,
      },
    };
  }

  await putFileToUploadUrl({
    absolutePath: tarballPath,
    uploadUrl: createResult.data.uploadUrl,
    contentType: createResult.data.contentType,
  });

  const completeResult = await apiService.completeApplicationTarballUpload({
    fileId: createResult.data.fileId,
  });

  if (!completeResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Upload failed: ${completeResult.error}`,
      },
    };
  }

  return {
    success: true,
    data: completeResult.data,
  };
};

export const appDeploy = (
  options: AppDeployOptions,
): Promise<CommandResult<AppDeployResult>> =>
  runSafe(() => innerAppDeploy(options), APP_ERROR_CODES.DEPLOY_FAILED);
