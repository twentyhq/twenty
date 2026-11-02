import { isDefined } from 'twenty-shared/utils';

import { checkLocalHealth } from '@/local/check-local-health';
import {
  type LocalContainer,
  type LocalEnvironment,
} from '@/local/types/local-environment.type';

export const getLocalStatus = async ({
  environment,
  container,
  signal,
}: {
  environment: Pick<LocalEnvironment, 'name' | 'port'>;
  container: Pick<LocalContainer, 'port' | 'image' | 'isRunning'> | undefined;
  signal: AbortSignal;
}) => {
  const data = {
    name: environment.name,
    url: `http://localhost:${container?.port ?? environment.port}`,
    image: container?.image ?? null,
  };
  if (!isDefined(container)) {
    return { ...data, status: 'not-created' };
  }
  if (!container.isRunning) {
    return { ...data, status: 'stopped' };
  }
  const isHealthy = await checkLocalHealth({ port: container.port, signal });
  return { ...data, status: isHealthy ? 'healthy' : 'starting' };
};
