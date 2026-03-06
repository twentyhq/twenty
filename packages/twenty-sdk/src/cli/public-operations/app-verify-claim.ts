import { ApiService } from '@/cli/utilities/api/api-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { APP_ERROR_CODES, type CommandResult } from './types';

type AppVerifyClaimOptions = {
  packageName: string;
  onProgress?: (message: string) => void;
};

type AppVerifyClaimResult = {
  registrationId: string;
  universalIdentifier: string;
  name: string;
};

const innerAppVerifyClaim = async (
  options: AppVerifyClaimOptions,
): Promise<CommandResult<AppVerifyClaimResult>> => {
  const { packageName, onProgress } = options;

  onProgress?.(`Verifying claim for "${packageName}" on npm...`);

  const apiService = new ApiService();

  const result = await apiService.verifyNpmPackageClaim(packageName);

  if (!result.success) {
    const errorMessage =
      result.error instanceof Error
        ? result.error.message
        : String(result.error ?? 'Unknown error');

    return {
      success: false,
      error: {
        code: APP_ERROR_CODES.CLAIM_FAILED,
        message: `Claim verification failed: ${errorMessage}`,
      },
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

export const appVerifyClaim = (
  options: AppVerifyClaimOptions,
): Promise<CommandResult<AppVerifyClaimResult>> =>
  runSafe(() => innerAppVerifyClaim(options), APP_ERROR_CODES.CLAIM_FAILED);
