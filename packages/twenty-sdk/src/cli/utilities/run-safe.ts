import { type CommandResult } from '@/cli/public-operations/types';

export const runSafe = async <T>(
  operation: () => Promise<CommandResult<T>>,
  fallbackErrorCode: string,
): Promise<CommandResult<T>> => {
  try {
    return await operation();
  } catch (error) {
    return {
      success: false,
      error: {
        code: fallbackErrorCode,
        message: error instanceof Error ? error.message : 'Unexpected error',
      },
    };
  }
};
