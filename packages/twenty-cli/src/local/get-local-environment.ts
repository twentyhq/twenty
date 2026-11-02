import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const LOCAL_IMAGE_REPOSITORY = 'twentycrm/twenty-app-dev';

const LOCAL_TEST_ENVIRONMENT_VARIABLES = [
  'MARKETPLACE_CATALOG_SYNC_CRON_ENABLED=false',
  'API_RATE_LIMITING_SHORT_LIMIT=100000',
  'API_RATE_LIMITING_LONG_LIMIT=100000',
];

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
    environmentVariables: isTest ? [...LOCAL_TEST_ENVIRONMENT_VARIABLES] : [],
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
