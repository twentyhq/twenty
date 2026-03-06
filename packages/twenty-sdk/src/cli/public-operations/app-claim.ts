import * as fs from 'fs';
import * as path from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

const CLAIM_FILE_NAME = 'twenty-claim.jwt';

export type AppClaimOptions = {
  packageName: string;
  appPath: string;
  onProgress?: (message: string) => void;
};

export type AppClaimResult = {
  claimFilePath: string;
};

const innerAppClaim = async (
  options: AppClaimOptions,
): Promise<CommandResult<AppClaimResult>> => {
  const { packageName, appPath, onProgress } = options;

  onProgress?.(`Generating claim token for "${packageName}"...`);

  const apiService = new ApiService();

  const result = await apiService.generateNpmClaimToken(packageName);

  if (!result.success) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : String(result.error ?? 'Unknown error');

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.CLAIM_FAILED,
        message: `Failed to generate claim token: ${errorMessage}`,
      },
    };
  }

  const claimFilePath = path.join(appPath, CLAIM_FILE_NAME);

  onProgress?.(`Writing claim file to ${claimFilePath}...`);
  fs.writeFileSync(claimFilePath, result.data.token, 'utf-8');

  return {
    success: true,
    data: { claimFilePath },
  };
};

export const appClaim = (
  options: AppClaimOptions,
): Promise<CommandResult<AppClaimResult>> =>
  runSafe(() => innerAppClaim(options), APP_ERROR_CODES.CLAIM_FAILED);
