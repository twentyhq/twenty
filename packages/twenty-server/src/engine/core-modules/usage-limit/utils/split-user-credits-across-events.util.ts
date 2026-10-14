import { type RecordUsageInputWithUserCredits } from 'src/engine/core-modules/usage/types/record-usage-input-with-user-credits.type';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

const toValidCreditAmountMicroOrZero = (amountMicro: number): number =>
  isValidCreditAmountMicro(amountMicro) ? amountMicro : 0;

export const splitUserCreditsAcrossEvents = ({
  events,
  userCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  userCreditsUsedMicro: number;
}): RecordUsageInputWithUserCredits[] =>
  events.reduce<{
    remainingMicro: number;
    eventsWithUserCredits: RecordUsageInputWithUserCredits[];
  }>(
    ({ remainingMicro, eventsWithUserCredits }, event) => {
      const eventUserCreditsUsedMicro = Math.min(
        remainingMicro,
        toValidCreditAmountMicroOrZero(event.creditsUsedMicro ?? 0),
      );

      return {
        remainingMicro: remainingMicro - eventUserCreditsUsedMicro,
        eventsWithUserCredits: [
          ...eventsWithUserCredits,
          { ...event, userCreditsUsedMicro: eventUserCreditsUsedMicro },
        ],
      };
    },
    {
      remainingMicro: toValidCreditAmountMicroOrZero(userCreditsUsedMicro),
      eventsWithUserCredits: [],
    },
  ).eventsWithUserCredits;
