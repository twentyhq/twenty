import { AnalyticsTinybirdJwtMap } from '~/generated-metadata/graphql';

export type AnalyticsComponentProps = {
  recordId: string;
  endpointName: keyof AnalyticsTinybirdJwtMap;
};
