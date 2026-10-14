import { splitUserCreditsAcrossEvents } from 'src/engine/core-modules/usage-limit/utils/split-user-credits-across-events.util';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export const subtractUserCredits = ({
  events,
  userCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  userCreditsUsedMicro: number;
}): RecordUsageInput[] =>
  splitUserCreditsAcrossEvents({ events, userCreditsUsedMicro }).map(
    ({ userCreditsUsedMicro: eventUserCreditsUsedMicro, ...event }) => ({
      ...event,
      creditsUsedMicro:
        (event.creditsUsedMicro ?? 0) - eventUserCreditsUsedMicro,
    }),
  );
