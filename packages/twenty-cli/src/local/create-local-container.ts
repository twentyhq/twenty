import { runDocker } from '@/local/run-docker';
import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const createLocalContainer = async ({
  environment,
  image,
  port,
  containerPort = port,
  environmentVariables = environment.environmentVariables,
  shouldStart = true,
  signal,
}: {
  environment: Pick<
    LocalEnvironment,
    'name' | 'volumes' | 'environmentVariables'
  >;
  image: string;
  port: number;
  containerPort?: number;
  environmentVariables?: string[];
  shouldStart?: boolean;
  signal: AbortSignal;
}) => {
  const variables = [`NODE_PORT=${containerPort}`, ...environmentVariables];
  if (!environmentVariables.some((value) => value.startsWith('SERVER_URL='))) {
    variables.push(`SERVER_URL=http://localhost:${port}`);
  }

  return runDocker({
    args: [
      ...(shouldStart ? ['run', '--detach'] : ['create']),
      '--name',
      environment.name,
      '--publish',
      `127.0.0.1:${port}:${containerPort}`,
      ...variables.flatMap((value) => ['--env', value]),
      ...Object.entries(environment.volumes).flatMap(([destination, name]) => [
        '--volume',
        `${name}:${destination}`,
      ]),
      image,
    ],
    signal,
  });
};
