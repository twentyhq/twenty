import { runDocker } from '@/local/run-docker';
import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const createLocalContainer = async ({
  environment,
  image,
  port,
  containerPort = port,
  environmentVariables = [],
  signal,
}: {
  environment: LocalEnvironment;
  image: string;
  port: number;
  containerPort?: number;
  environmentVariables?: string[];
  signal: AbortSignal;
}) =>
  runDocker({
    args: [
      'run',
      '--detach',
      '--name',
      environment.name,
      '--publish',
      `127.0.0.1:${port}:${containerPort}`,
      '--env',
      `NODE_PORT=${containerPort}`,
      '--env',
      `SERVER_URL=http://localhost:${port}`,
      ...environmentVariables.flatMap((value) => ['--env', value]),
      ...Object.entries(environment.volumes).flatMap(([destination, name]) => [
        '--volume',
        `${name}:${destination}`,
      ]),
      image,
    ],
    signal,
  });
