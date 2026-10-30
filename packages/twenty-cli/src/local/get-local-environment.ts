import { type LocalEnvironment } from '@/local/types/local-environment.type';

export const LOCAL_IMAGE_REPOSITORY = 'twentycrm/twenty-app-dev';

export const getLocalEnvironment = (isTest: boolean): LocalEnvironment => {
  const name = isTest ? 'twenty-app-dev-test' : 'twenty-app-dev';

  return {
    name,
    port: isTest ? 2021 : 2020,
    volumes: {
      '/data/postgres': `${name}-data`,
      '/data/clickhouse': `${name}-clickhouse`,
      '/app/packages/twenty-server/.local-storage': `${name}-storage`,
    },
  };
};
