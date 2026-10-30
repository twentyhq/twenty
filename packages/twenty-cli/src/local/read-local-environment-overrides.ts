import { readLocalImageEnvironment } from '@/local/read-local-image-environment';
import { type LocalContainer } from '@/local/types/local-environment.type';

export const readLocalEnvironmentOverrides = async ({
  container,
  signal,
}: {
  container: Pick<LocalContainer, 'imageId' | 'environmentVariables'>;
  signal: AbortSignal;
}): Promise<string[]> => {
  const defaults = await readLocalImageEnvironment({
    imageId: container.imageId,
    signal,
  });

  return container.environmentVariables.filter(
    (value) => !value.startsWith('NODE_PORT=') && !defaults.includes(value),
  );
};
