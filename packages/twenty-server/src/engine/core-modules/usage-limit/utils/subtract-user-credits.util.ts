import { apportionUserCredits } from 'src/engine/core-modules/usage-limit/utils/apportion-user-credits.util';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export const subtractUserCredits = ({
  events,
  userCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  userCreditsUsedMicro: number;
}): RecordUsageInput[] =>
  apportionUserCredits({ events, userCreditsUsedMicro }).map(
    ({ userCreditsUsedMicro: eventUserCreditsUsedMicro, ...event }) => ({
      ...event,
      creditsUsedMicro:
        (event.creditsUsedMicro ?? 0) - eventUserCreditsUsedMicro,
    }),
  );
