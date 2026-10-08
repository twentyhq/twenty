import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';

export const runAuthTokenCommand: CommandRun<TargetCommandContext> = async ({
  target,
}) => ({
  data: { token: target.bearerToken, credentials: target.credentialKind },
  human: target.bearerToken,
});
