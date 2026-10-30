import isLessThan from 'semver/functions/lt';
import { isDefined } from 'twenty-shared/utils';
import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { readLocalImageVersion } from '@/local/read-local-image-version';
import { replaceLocalContainer } from '@/local/replace-local-container';
import { getLocalStatus } from '@/local/get-local-status';
import { readLocalOptions } from '@/local/read-local-options';
import {
  assertLocalStorage,
  readLocalContainer,
} from '@/local/read-local-container';
import { readLocalEnvironmentOverrides } from '@/local/read-local-environment-overrides';
import { waitForLocalEnvironment } from '@/local/wait-for-local-environment';
import { resolveLocalImage } from '@/local/resolve-local-image';
import { runDocker } from '@/local/run-docker';
import { CliError } from '@/output/cli-error';

export const runLocalUpgradeCommand: CommandRun<CommandContext> = async ({
  options,
  arguments: commandArguments,
  output,
  signal,
}) => {
  const { environment } = readLocalOptions(options);
  await checkLocalRuntime(signal);
  const existing = await readLocalContainer({ environment, signal });
  if (!isDefined(existing)) {
    throw new CliError({
      code: 'NOT_FOUND',
      message: 'No local environment has been created.',
      hint: 'Use twenty local start with the desired version first.',
    });
  }
  assertLocalStorage({ environment, container: existing });
  const image = await resolveLocalImage({
    version: readStringArgument(commandArguments, 0),
    signal,
  });
  output.progress({ message: `Pulling ${image}…` });
  await runDocker({ args: ['pull', image], signal });
  const nextImageId = (
    await runDocker({
      args: ['image', 'inspect', '--format', '{{.Id}}', image],
      signal,
    })
  ).trim();
  if (existing.imageId === nextImageId) {
    return {
      data: {
        ...(await getLocalStatus({ environment, container: existing, signal })),
        isUpgraded: false,
      },
      human: `Already using ${image}.`,
    };
  }
  const currentVersion = await readLocalImageVersion({
    imageId: existing.imageId,
    signal,
  });
  const nextVersion = await readLocalImageVersion({
    imageId: nextImageId,
    signal,
  });
  if (isLessThan(nextVersion, currentVersion)) {
    throw new CliError({
      code: 'CONFLICT',
      message: `Cannot downgrade the local environment from ${currentVersion} to ${nextVersion}.`,
      hint: 'Database migrations cannot be rolled back. Keep the current version or use a newer one.',
    });
  }
  const environmentVariables = await readLocalEnvironmentOverrides({
    container: existing,
    signal,
  });
  output.progress({
    message: 'Replacing the local environment, preserving its data volumes…',
  });
  await replaceLocalContainer({
    environment,
    existing,
    image,
    environmentVariables,
    signal,
  });
  const data = await waitForLocalEnvironment({
    environment: { ...environment, port: existing.port },
    signal,
  });
  return {
    data: { ...data, isUpgraded: true, isDataPreserved: true },
    human: `Local environment upgraded to ${image} at ${data.url}. Data volumes preserved.`,
  };
};
