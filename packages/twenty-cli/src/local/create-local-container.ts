import { runDocker } from '@/local/run-docker';
import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const createLocalContainer = async ({
  environment,
  image,
  port,
  signal,
}: {
  environment: Pick<
    LocalEnvironment,
    'name' | 'volumes' | 'environmentVariables'
  >;
  image: string;
  port: number;
  signal: AbortSignal;
}) =>
  runDocker({
    args: [
      'run',
      '--detach',
      '--name',
      environment.name,
      '--publish',
      `127.0.0.1:${port}:${port}`,
      '--env',
      `NODE_PORT=${port}`,
      '--env',
      `SERVER_URL=http://localhost:${port}`,
      ...environment.environmentVariables.flatMap((value) => ['--env', value]),
      ...Object.entries(environment.volumes).flatMap(([destination, name]) => [
        '--volume',
        `${name}:${destination}`,
      ]),
      image,
    ],
    signal,
  });
