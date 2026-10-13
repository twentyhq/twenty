import { type FundedRecordUsageInput } from 'src/engine/core-modules/usage/types/funded-record-usage-input.type';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

const toApportionableMicro = (amountMicro: number): number =>
  isValidCreditAmountMicro(amountMicro) ? amountMicro : 0;

export const apportionMemberCredits = ({
  events,
  memberCreditsUsedMicro,
}: {
  events: RecordUsageInput[];
  memberCreditsUsedMicro: number;
}): FundedRecordUsageInput[] =>
  events.reduce<{
    remainingMicro: number;
    fundedEvents: FundedRecordUsageInput[];
  }>(
    ({ remainingMicro, fundedEvents }, event) => {
      const eventMemberCreditsUsedMicro = Math.min(
        remainingMicro,
        toApportionableMicro(event.creditsUsedMicro ?? 0),
      );

      return {
        remainingMicro: remainingMicro - eventMemberCreditsUsedMicro,
        fundedEvents: [
          ...fundedEvents,
          { ...event, memberCreditsUsedMicro: eventMemberCreditsUsedMicro },
        ],
      };
    },
    {
      remainingMicro: toApportionableMicro(memberCreditsUsedMicro),
      fundedEvents: [],
    },
  ).fundedEvents;
