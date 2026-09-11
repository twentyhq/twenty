import fs from 'fs';
import path from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { type PrivateApplicationDeploymentLogo } from '@/cli/utilities/api/file-api';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { readJson } from '@/cli/utilities/file/fs-utils';
import { putFileToUploadUrl } from '@/cli/utilities/file/put-file-to-upload-url';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from '@/cli/types';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type BuiltManifest = {
  application?: { universalIdentifier?: string; logo?: string };
};

// The logo is declared in the manifest as a path into the app source, which is
// not part of the build output the tarball carries.
const resolveLogoPath = ({
  appPath,
  logo,
}: {
  appPath: string;
  logo: string | undefined;
}): string | undefined => {
  if (!isDefined(logo) || /^https?:\/\//.test(logo)) {
    return undefined;
  }

  const absolutePath = path.resolve(appPath, logo);

  return fs.existsSync(absolutePath) ? absolutePath : undefined;
};

export type AppDeployOptions = {
  tarballPath: string;
  appPath: string;
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

  // The tarball is packed from the output directory, so the identity the
  // server registers is read from the same files the archive carries.
  const outputDir = path.join(options.appPath, OUTPUT_DIR);

  const manifest = await readJson<BuiltManifest>(
    path.join(outputDir, 'manifest.json'),
  );
  const { version } = await readJson<{ version?: string }>(
    path.join(outputDir, 'package.json'),
  );

  const universalIdentifier = manifest.application?.universalIdentifier;

  if (!isDefined(universalIdentifier) || !isDefined(version)) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `The built app must declare a universalIdentifier in manifest.json and a version in package.json under ${OUTPUT_DIR}`,
      },
    };
  }

  const logoPath = resolveLogoPath({
    appPath: options.appPath,
    logo: manifest.application?.logo,
  });

  const logo: PrivateApplicationDeploymentLogo | undefined = isDefined(logoPath)
    ? { filename: path.basename(logoPath), size: fs.statSync(logoPath).size }
    : undefined;

  const apiService = new ApiService({
    serverUrl: options.serverUrl,
    token: options.token,
  });

  const createResult = await apiService.createPrivateApplicationDeployment({
    universalIdentifier,
    version,
    tarballSize: fs.statSync(tarballPath).size,
    logo,
  });

  if (!createResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Deploy failed: ${createResult.error}`,
      },
    };
  }

  const { deploymentId, tarball, logo: logoTarget } = createResult.data;

  await putFileToUploadUrl({
    absolutePath: tarballPath,
    uploadUrl: tarball.uploadUrl,
    contentType: tarball.contentType,
  });

  if (isDefined(logoPath) && isDefined(logoTarget)) {
    await putFileToUploadUrl({
      absolutePath: logoPath,
      uploadUrl: logoTarget.uploadUrl,
      contentType: logoTarget.contentType,
    });
  }

  const completeResult = await apiService.completePrivateApplicationDeployment({
    deploymentId,
  });

  if (!completeResult.success) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.DEPLOY_FAILED,
        message: `Deploy failed: ${completeResult.error}`,
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
