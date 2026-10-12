import { type ApplicationRegistrationMetricName } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-name.type';

export type ApplicationRegistrationMetricInput = {
  applicationRegistrationId: string;
  metric: ApplicationRegistrationMetricName;
  universalIdentifier?: string | null;
  version?: string | null;
  dimension?: string | null;
  context?: string | null;
  workspaceHash?: string | null;
  value?: number;
  timestamp?: Date;
};
