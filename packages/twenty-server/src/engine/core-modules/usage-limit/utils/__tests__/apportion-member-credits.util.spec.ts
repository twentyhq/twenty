import { apportionMemberCredits } from 'src/engine/core-modules/usage-limit/utils/apportion-member-credits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const buildEvent = (creditsUsedMicro?: number): RecordUsageInput => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  creditsUsedMicro,
  quantity: 1_200,
  unit: UsageUnit.TOKEN,
  spenders: { userWorkspaceId: 'user-workspace-1' },
});

const findShares = (
  events: RecordUsageInput[],
  memberCreditsUsedMicro: number,
) =>
  apportionMemberCredits({ events, memberCreditsUsedMicro }).map(
    (event) => event.memberCreditsUsedMicro,
  );

describe('apportionMemberCredits', () => {
  it('stamps the share on a single event and keeps the event as it was', () => {
    const event = buildEvent(300);

    expect(
      apportionMemberCredits({ events: [event], memberCreditsUsedMicro: 100 }),
    ).toEqual([{ ...event, memberCreditsUsedMicro: 100 }]);
  });

  it('fills the events in order, each up to its own credits', () => {
    expect(
      findShares([buildEvent(100), buildEvent(300), buildEvent(200)], 250),
    ).toEqual([100, 150, 0]);
  });

  it('drops the part of a share above the credits of the events', () => {
    expect(findShares([buildEvent(100), buildEvent(200)], 1_000)).toEqual([
      100, 200,
    ]);
  });

  it('gives no share to an event whose credits are missing or not a whole number', () => {
    expect(
      findShares(
        [buildEvent(undefined), buildEvent(100.5), buildEvent(300)],
        250,
      ),
    ).toEqual([0, 0, 250]);
  });

  it('stamps 0 everywhere for a share that is not a whole number', () => {
    expect(findShares([buildEvent(300)], 100.5)).toEqual([0]);
  });
});
