import satisfies from 'semver/functions/satisfies';
import valid from 'semver/functions/valid';
import { isDefined } from 'twenty-shared/utils';

import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { checkLocalRuntime } from '@/local/check-local-runtime';
import { createLocalContainer } from '@/local/create-local-container';
import { readLocalOptions } from '@/local/read-local-options';
import { readLocalContainer } from '@/local/read-local-container';
import { getLocalEngineRange } from '@/local/get-local-engine-range';
import { getLocalImage } from '@/local/get-local-image';
import { resolveLocalImage } from '@/local/resolve-local-image';
import { runDocker } from '@/local/run-docker';
import { waitForLocalEnvironment } from '@/local/wait-for-local-environment';
import { CliError } from '@/output/cli-error';

export const runLocalStartCommand: CommandRun<CommandContext> = async ({
  options,
  arguments: commandArguments,
  output,
  signal,
}) => {
  const { environment, port: requestedPort } = readLocalOptions(options);
  const version = readStringArgument(commandArguments, 0);
  const requestedImage = isDefined(version)
    ? getLocalImage(version)
    : undefined;

  await checkLocalRuntime(signal);
  const existing = await readLocalContainer({ environment, signal });
  const port = existing?.port ?? requestedPort ?? environment.port;

  if (
    existing &&
    ((isDefined(requestedPort) && requestedPort !== existing.port) ||
      (isDefined(requestedImage) && requestedImage !== existing.image))
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${environment.name} already uses ${existing.image} on port ${existing.port}.`,
      hint: 'Omit --port to reuse this instance. Use twenty local upgrade to change its version.',
    });
  }

  if (existing) {
    const range = getLocalEngineRange();
    const existingVersion = valid(existing.image.split(':').at(-1));
    if (
      isDefined(range) &&
      (!isDefined(existingVersion) || !satisfies(existingVersion, range))
    ) {
      output.warn({
        code: 'LOCAL_VERSION_MISMATCH',
        message: `The existing image ${existing.image} does not establish compatibility with engines.twenty ${range}. Use twenty local upgrade to change version.`,
      });
    }
    if (!existing.isRunning) {
      output.progress({ message: 'Starting the existing local environment…' });
      await runDocker({ args: ['start', existing.id], signal });
    }
  } else {
    const image =
      requestedImage ??
      (await resolveLocalImage({ version: undefined, signal }));
    output.progress({ message: `Pulling ${image}…` });
    await runDocker({ args: ['pull', image], signal });
    output.progress({
      message: `Starting ${image} on http://localhost:${port}…`,
    });
    await createLocalContainer({ environment, image, port, signal });
  }

  output.progress({
    message: 'Waiting for the local environment to be ready…',
  });
  const data = await waitForLocalEnvironment({
    environment: { ...environment, port },
    signal,
  });

  return {
    data,
    human: `Local Twenty is ready at ${data.url}\nSign in: twenty auth login --url ${data.url} --name ${options.test ? 'local-test' : 'local'}`,
  };
};
