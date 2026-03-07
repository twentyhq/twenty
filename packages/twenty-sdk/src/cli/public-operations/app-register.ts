import * as fs from 'fs';
import * as path from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

export type AppRegisterOptions = {
  packageName?: string;
  appPath?: string;
  workspace?: string;
};

export type AppRegisterResult = {
  id: string;
  universalIdentifier: string;
  name: string;
  isProvenanceVerified: boolean;
  provenanceRepositoryUrl: string | null;
};

const readPackageNameFromDir = (appPath: string): string | undefined => {
  try {
    const packageJsonPath = path.join(appPath, 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content) as { name?: string };

    return packageJson.name;
  } catch {
    return undefined;
  }
};

const innerAppRegister = async (
  options: AppRegisterOptions,
): Promise<CommandResult<AppRegisterResult>> => {
  if (options.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  let packageName = options.packageName;

  if (!packageName && options.appPath) {
    packageName = readPackageNameFromDir(options.appPath);
  }

  if (!packageName) {
    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.REGISTER_FAILED,
        message:
          'Package name is required. Provide it as an argument or run from an app directory with a package.json.',
      },
    };
  }

  const apiService = new ApiService();
  const result = await apiService.registerNpmPackage(packageName);

  if (!result.success) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : String(result.error ?? 'Unknown error');

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.REGISTER_FAILED,
        message: errorMessage,
      },
    };
  }

  return { success: true, data: result.data };
};

export const appRegister = (
  options: AppRegisterOptions,
): Promise<CommandResult<AppRegisterResult>> =>
  runSafe(() => innerAppRegister(options), APP_ERROR_CODES.REGISTER_FAILED);
