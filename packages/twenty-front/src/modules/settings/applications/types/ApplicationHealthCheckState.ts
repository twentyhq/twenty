import { type ApplicationHealthCheckResultFieldsFragment } from '~/generated-metadata/graphql';

export type ApplicationHealthCheckState = {
  runId: string | null;
  result: ApplicationHealthCheckResultFieldsFragment | null;
};
