import {
  runTypecheck,
  type TypecheckError,
} from '@/cli/utilities/build/common/typecheck-plugin';
import { type CommandResult, type TypecheckResult } from '@/cli/public-operations/types';

export type AppTypecheckOptions = {
  appPath: string;
};

export const appTypecheck = async (
  options: AppTypecheckOptions,
): Promise<CommandResult<TypecheckResult>> => {
  const errors: TypecheckError[] = await runTypecheck(options.appPath);

  return {
    success: true,
    data: { errors },
  };
};
