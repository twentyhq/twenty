import { myApplicationHealthCheckFamilyState } from '@/settings/app-preferences/states/myApplicationHealthCheckFamilyState';
import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';
import {
  RunMyApplicationHealthCheckDocument,
  type RunMyApplicationHealthCheckMutation,
} from '~/generated-metadata/graphql';

export const MY_APPLICATION_HEALTH_CHECK_RUNNER: ApplicationHealthCheckRunner<RunMyApplicationHealthCheckMutation> =
  {
    healthCheckFamilyState: myApplicationHealthCheckFamilyState,
    healthCheckMutation: RunMyApplicationHealthCheckDocument,
    getHealthCheckResult: ({ runMyApplicationHealthCheck }) =>
      runMyApplicationHealthCheck,
  };
