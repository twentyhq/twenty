import { type CliError } from '@/output/cli-error';
import { type CliWarning } from '@/output/types/cli-warning.type';
import { type CommandResult } from '@/output/types/command-result.type';
import { type PublicTarget } from '@/target/types/public-target.type';

export type Output = {
  event: (
    type: 'start' | 'record' | 'progress',
    data: unknown,
    signal: AbortSignal,
  ) => Promise<void>;
  warn: (warning: CliWarning) => void;
  progress: (progress: { message: string; percentage?: number }) => void;
  succeed: (result: CommandResult, target?: PublicTarget) => void;
  fail: (error: CliError, target?: PublicTarget) => void;
};
