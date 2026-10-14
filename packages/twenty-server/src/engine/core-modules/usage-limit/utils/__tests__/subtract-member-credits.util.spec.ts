import { subtractMemberCredits } from 'src/engine/core-modules/usage-limit/utils/subtract-member-credits.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';

const buildEvent = (creditsUsedMicro: number): RecordUsageInput => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  unit: UsageUnit.TOKEN,
  quantity: 10,
  creditsUsedMicro,
  spenders: { userWorkspaceId: 'user-workspace-1' },
});

describe('subtractMemberCredits', () => {
  it('leaves the workspace-funded remainder on each event, in order', () => {
    expect(
      subtractMemberCredits({
        events: [buildEvent(300), buildEvent(500)],
        memberCreditsUsedMicro: 600,
      }).map(({ creditsUsedMicro }) => creditsUsedMicro),
    ).toEqual([0, 200]);
  });

  it('keeps every event whole when the member paid nothing', () => {
    expect(
      subtractMemberCredits({
        events: [buildEvent(300)],
        memberCreditsUsedMicro: 0,
      }).map(({ creditsUsedMicro }) => creditsUsedMicro),
    ).toEqual([300]);
  });
});
