import { apportionMemberCredits } from 'src/engine/core-modules/usage-limit/utils/apportion-member-credits.util';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

export const subtractMemberCredits = ({
  events,
  memberCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  memberCreditsUsedMicro: number;
}): RecordUsageInput[] =>
  apportionMemberCredits({ events, memberCreditsUsedMicro }).map(
    ({ memberCreditsUsedMicro: eventMemberCreditsUsedMicro, ...event }) => ({
      ...event,
      creditsUsedMicro:
        (event.creditsUsedMicro ?? 0) - eventMemberCreditsUsedMicro,
    }),
  );
