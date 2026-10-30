import { workspaceApplicationHealthCheckFamilyState } from '@/settings/applications/states/workspaceApplicationHealthCheckFamilyState';
import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';
import {
  RunApplicationHealthCheckDocument,
  type RunApplicationHealthCheckMutation,
} from '~/generated-metadata/graphql';

export const WORKSPACE_APPLICATION_HEALTH_CHECK_RUNNER: ApplicationHealthCheckRunner<RunApplicationHealthCheckMutation> =
  {
    healthCheckFamilyState: workspaceApplicationHealthCheckFamilyState,
    healthCheckMutation: RunApplicationHealthCheckDocument,
    getHealthCheckResult: ({ runApplicationHealthCheck }) =>
      runApplicationHealthCheck,
  };
