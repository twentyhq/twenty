import { checkLocalHealth } from '@/local/check-local-health';
import {
  type LocalContainer,
  type LocalEnvironment,
} from '@/local/types/local-environment.type';

export const getLocalStatus = async (
  environment: LocalEnvironment,
  container: LocalContainer | undefined,
  signal: AbortSignal,
) => ({
  name: environment.name,
  status: !container
    ? 'not-created'
    : !container.running
      ? 'stopped'
      : (await checkLocalHealth(container.port, signal))
        ? 'healthy'
        : 'starting',
  url: `http://localhost:${container?.port ?? environment.port}`,
  image: container?.image ?? null,
});
