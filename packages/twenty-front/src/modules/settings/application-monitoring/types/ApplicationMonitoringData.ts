import { type FindApplicationRegistrationMonitoringQuery } from '~/generated-metadata/graphql';

export type ApplicationMonitoringData = Omit<
  FindApplicationRegistrationMonitoringQuery['findApplicationRegistrationMonitoring'],
  '__typename'
>;
