import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const LOCAL_IMAGE_REPOSITORY = 'twentycrm/twenty-app-dev';

export const getLocalEnvironment = (isTest: boolean): LocalEnvironment => {
  const name = isTest ? 'twenty-app-dev-test' : 'twenty-app-dev';

  return {
    name,
    port: isTest ? 2021 : 2020,
    environmentVariables: isTest
      ? [
          'MARKETPLACE_CATALOG_SYNC_CRON_ENABLED=false',
          'API_RATE_LIMITING_SHORT_LIMIT=100000',
          'API_RATE_LIMITING_LONG_LIMIT=100000',
        ]
      : [],
    volumes: {
      '/data/postgres': `${name}-data`,
      '/data/clickhouse': `${name}-clickhouse`,
      '/app/packages/twenty-server/.local-storage': `${name}-storage`,
    },
  };
};
