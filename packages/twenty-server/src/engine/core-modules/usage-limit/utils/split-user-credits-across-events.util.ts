import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

export const splitUserCreditsAcrossEvents = ({
  events,
  userCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  userCreditsUsedMicro: number;
}): RecordUsageInput[] => {
  let remainingMicro = userCreditsUsedMicro;

  return events.map((event) => {
    const creditsUsedMicro = event.creditsUsedMicro ?? 0;
    const eventUserCreditsUsedMicro = isValidCreditAmountMicro(creditsUsedMicro)
      ? Math.min(remainingMicro, creditsUsedMicro)
      : 0;

    remainingMicro -= eventUserCreditsUsedMicro;

    return { ...event, userCreditsUsedMicro: eventUserCreditsUsedMicro };
  });
};
