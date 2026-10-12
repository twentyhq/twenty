import { CliError } from '@/output/cli-error';

export const getToolingErrorContext = (error: unknown) =>
  error instanceof CliError ? { hint: error.hint, details: error.details } : {};
