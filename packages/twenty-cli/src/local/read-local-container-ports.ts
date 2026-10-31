import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';

export const readLocalContainerPorts = ({
  containerName,
  portBindings,
}: {
  containerName: string;
  portBindings: Record<string, unknown>;
}) => {
  const tcpPorts = Object.entries(portBindings).filter(([key]) =>
    key.endsWith('/tcp'),
  );
  if (tcpPorts.length !== 1) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${containerName} must publish exactly one TCP port.`,
    });
  }

  const [containerPortKey, bindings] = tcpPorts[0];
  if (
    !isArray(bindings) ||
    bindings.length !== 1 ||
    !isPlainObject(bindings[0]) ||
    !isString(bindings[0].HostPort)
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${containerName} must bind its TCP port to exactly one host port.`,
    });
  }

  const port = Number(bindings[0].HostPort);
  const containerPort = Number(containerPortKey.split('/')[0]);
  if (
    ![port, containerPort].every(
      (value) => Number.isInteger(value) && value >= 1 && value <= 65535,
    )
  ) {
    throw new CliError({
      code: 'CONFLICT',
      message: `${containerName} has a port outside the range 1 to 65535.`,
    });
  }

  return { port, containerPort };
};
