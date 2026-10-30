import { isArray, isBoolean, isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { LOCAL_IMAGE_REPOSITORY } from '@/local/get-local-environment';
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
    !isString(value.Image) ||
    !isPlainObject(value.Config) ||
    !isString(value.Config.Image) ||
    !isArray(value.Config.Env) ||
    !value.Config.Env.every(isString) ||
    !isPlainObject(value.State) ||
    !isBoolean(value.State.Running) ||
    !isPlainObject(value.HostConfig) ||
    !isPlainObject(value.HostConfig.PortBindings) ||
    !isArray(value.Mounts)
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

  const ports = Object.entries(value.HostConfig.PortBindings).filter(([key]) =>
    key.endsWith('/tcp'),
  );
  const [containerPortKey, bindings] = ports[0] ?? [];
  const binding = isArray(bindings) ? bindings[0] : undefined;
  const port =
    isPlainObject(binding) && isString(binding.HostPort)
      ? Number(binding.HostPort)
      : NaN;
  const containerPort = Number(containerPortKey?.split('/')[0]);

  if (
    ports.length !== 1 ||
    !isArray(bindings) ||
    bindings.length !== 1 ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !Number.isInteger(containerPort) ||
    containerPort < 1 ||
    containerPort > 65535
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${environment.name} has an unsupported port or storage configuration.`,
    });
  }

  const mounts = value.Mounts.map((mount: unknown) => {
    if (
      !isPlainObject(mount) ||
      !isString(mount.Type) ||
      !isString(mount.Destination) ||
      (isDefined(mount.Name) && !isString(mount.Name))
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'Docker returned an invalid mount description.',
      });
    }
    return {
      Type: mount.Type,
      Destination: mount.Destination,
      Name: isString(mount.Name) ? mount.Name : undefined,
    };
  });

  return {
    id: value.Id,
    image,
    imageId: value.Image,
    environmentVariables: value.Config.Env,
    isRunning: value.State.Running,
    port,
    containerPort,
    mounts,
  };
};

export const assertLocalStorage = ({
  environment,
  container,
}: {
  environment: Pick<
    LocalEnvironment,
    'name' | 'volumes' | 'requiredVolumeDestinations'
  >;
  container: Pick<LocalContainer, 'mounts'>;
}) => {
  if (
    !environment.requiredVolumeDestinations.every((destination) =>
      container.mounts.some((mount) => mount.Destination === destination),
    ) ||
    container.mounts.some(
      (mount) =>
        mount.Type !== 'volume' ||
        environment.volumes[mount.Destination] !== mount.Name,
    )
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${environment.name} uses custom storage.`,
      hint: 'Manage this container directly with Docker to preserve its storage configuration.',
    });
  }
};
