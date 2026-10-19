import { isDefined } from 'twenty-shared/utils';

import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const shouldOpenGettingStarted = ({
  remainingSteps,
  snoozedUntil,
  now,
}: {
  remainingSteps: GettingStartedStep[];
  snoozedUntil: string | null | undefined;
  now: Date;
}): boolean =>
  remainingSteps.length > 0 &&
  (!isDefined(snoozedUntil) || Date.parse(snoozedUntil) <= now.getTime());
