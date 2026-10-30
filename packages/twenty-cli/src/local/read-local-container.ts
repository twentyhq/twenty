import { isBoolean, isNonEmptyString, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { LOCAL_IMAGE_REPOSITORY } from '@/local/get-local-environment';
import { readLocalContainerPorts } from '@/local/read-local-container-ports';
import { runDocker } from '@/local/run-docker';
import {
  type LocalContainer,
  type LocalEnvironment,
} from '@/local/types/local-environment.type';
import { CliError } from '@/output/cli-error';

export const readLocalContainer = async ({
  environment,
  signal,
}: {
  environment: Pick<LocalEnvironment, 'name'>;
  signal: AbortSignal;
}): Promise<LocalContainer | undefined> => {
  const id = (
    await runDocker({
      args: [
        'container',
        'ls',
        '--all',
        '--filter',
        `name=^/${environment.name}$`,
        '--format',
        '{{.ID}}',
      ],
      signal,
    })
  ).trim();

  if (!isNonEmptyString(id)) {
    return undefined;
  }

  const value: unknown = JSON.parse(
    await runDocker({
      args: ['container', 'inspect', '--format', '{{json .}}', id],
      signal,
    }),
  );

  if (
    !isPlainObject(value) ||
    !isString(value.Id) ||
    !isPlainObject(value.Config) ||
    !isString(value.Config.Image) ||
    !isPlainObject(value.State) ||
    !isBoolean(value.State.Running) ||
    !isPlainObject(value.HostConfig) ||
    !isPlainObject(value.HostConfig.PortBindings)
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'Docker returned an invalid container description.',
    });
  }

  const image = value.Config.Image;

  if (
    !image.startsWith(`${LOCAL_IMAGE_REPOSITORY}:`) &&
    !image.startsWith(`${LOCAL_IMAGE_REPOSITORY}@`)
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${environment.name} belongs to another image.`,
      hint: 'Rename that container before using twenty local.',
    });
  }

  const { port } = readLocalContainerPorts({
    containerName: environment.name,
    portBindings: value.HostConfig.PortBindings,
  });

  return {
    id: value.Id,
    image,
    isRunning: value.State.Running,
    port,
  };
};
