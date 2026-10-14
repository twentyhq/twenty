import { type FundedRecordUsageInput } from 'src/engine/core-modules/usage/types/funded-record-usage-input.type';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

const toApportionableMicro = (amountMicro: number): number =>
  isValidCreditAmountMicro(amountMicro) ? amountMicro : 0;

export const apportionUserCredits = ({
  events,
  userCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  userCreditsUsedMicro: number;
}): FundedRecordUsageInput[] =>
  events.reduce<{
    remainingMicro: number;
    fundedEvents: FundedRecordUsageInput[];
  }>(
    ({ remainingMicro, fundedEvents }, event) => {
      const eventUserCreditsUsedMicro = Math.min(
        remainingMicro,
        toApportionableMicro(event.creditsUsedMicro ?? 0),
      );

      return {
        remainingMicro: remainingMicro - eventUserCreditsUsedMicro,
        fundedEvents: [
          ...fundedEvents,
          { ...event, userCreditsUsedMicro: eventUserCreditsUsedMicro },
        ],
      };
    },
    {
      remainingMicro: toApportionableMicro(userCreditsUsedMicro),
      fundedEvents: [],
    },
  ).fundedEvents;
