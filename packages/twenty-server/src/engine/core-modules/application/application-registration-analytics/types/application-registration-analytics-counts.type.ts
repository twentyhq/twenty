import { type ApplicationRegistrationCountField } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-count-metric-fields.constant';

export type ApplicationRegistrationAnalyticsCounts = Record<
  ApplicationRegistrationCountField,
  number
> & {
  creditsCharged: number;
};
