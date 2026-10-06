import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { readStringOption } from '@/catalog/read-command-values';
import { getConfigPath } from '@/config/get-config-path';
import { CliError } from '@/output/cli-error';
import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';
import { resolveTarget } from '@/target/resolve-target';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

export const resolveCommandTarget = async ({
  options,
  outputMode,
  output,
  signal,
}: {
  options: Record<string, unknown>;
  outputMode: OutputMode;
  output: Output;
  signal: AbortSignal;
}) => {
  const configPath = getConfigPath();
  const canInteract = isInteractionAllowed({ options, outputMode });
  let attemptedSignIn = false;

  const onAuthenticationRequired = async ({
    target,
    error,
  }: {
    target: ResolvedTarget;
    error: unknown;
  }) => {
    const refreshFailure =
      error instanceof CliError ? error.details?.refresh : undefined;

    if (
      !canInteract ||
      attemptedSignIn ||
      signal.aborted ||
      target.source !== 'remote' ||
      target.credentialKind !== 'oauth' ||
      !isDefined(target.remoteName) ||
      !(error instanceof CliError) ||
      error.code !== 'AUTH_REQUIRED' ||
      (isPlainObject(refreshFailure) &&
        refreshFailure.status !== 400 &&
        refreshFailure.status !== 401)
    ) {
      throw error;
    }

    attemptedSignIn = true;
    const { signInToRemoteAgain } =
      await import('@/oauth/sign-in-to-remote-again');

    return signInToRemoteAgain({
      target,
      remoteName: target.remoteName,
      error,
      configPath,
      output,
      signal,
    });
  };

  const target = await resolveTarget({
    environment: process.env,
    remoteFlag: readStringOption(options, 'remote'),
    configPath,
    signal,
    warn: output.warn,
    onAuthenticationRequired,
  });

  if (!canInteract || target.credentialKind !== 'oauth' || attemptedSignIn) {
    return target;
  }

  const { fetchSignedInIdentity } =
    await import('@/transport/metadata/fetch-signed-in-identity');

  try {
    await fetchSignedInIdentity({ target, signal });

    return target;
  } catch (error) {
    return onAuthenticationRequired({ target, error });
  }
};
