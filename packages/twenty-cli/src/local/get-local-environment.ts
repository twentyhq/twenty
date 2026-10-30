import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const LOCAL_IMAGE_REPOSITORY = 'twentycrm/twenty-app-dev';

const LOCAL_VOLUME_DEFINITIONS = [
  { destination: '/data/postgres', suffix: 'data', isRequired: true },
  { destination: '/data/clickhouse', suffix: 'clickhouse', isRequired: false },
  {
    destination: '/app/packages/twenty-server/.local-storage',
    suffix: 'storage',
    isRequired: true,
  },
];

export const getLocalEnvironment = (isTest: boolean): LocalEnvironment => {
  const name = isTest ? 'twenty-app-dev-test' : 'twenty-app-dev';

  return {
    name,
    port: isTest ? 2021 : 2020,
    volumes: Object.fromEntries(
      LOCAL_VOLUME_DEFINITIONS.map(({ destination, suffix }) => [
        destination,
        `${name}-${suffix}`,
      ]),
    ),
    requiredVolumeDestinations: LOCAL_VOLUME_DEFINITIONS.filter(
      ({ isRequired }) => isRequired,
    ).map(({ destination }) => destination),
  };
};
