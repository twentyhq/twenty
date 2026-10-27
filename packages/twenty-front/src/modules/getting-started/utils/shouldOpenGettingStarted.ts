import { isDefined } from 'twenty-shared/utils';

import { type GettingStartedStep } from '~/generated-metadata/graphql';

export const shouldOpenGettingStarted = ({
  remainingSteps,
  snoozedUntil,
  isHidden,
  now,
}: {
  remainingSteps: GettingStartedStep[];
  snoozedUntil: string | null | undefined;
  isHidden: boolean;
  now: Date;
}): boolean =>
  !isHidden &&
  remainingSteps.length > 0 &&
  (!isDefined(snoozedUntil) || Date.parse(snoozedUntil) <= now.getTime());
