import { isUserCreditsEligibleEvent } from 'src/engine/core-modules/usage-limit/utils/is-user-credits-eligible-event.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const USER_WORKSPACE_ID = 'user-workspace-1';

type EligibilityEvent = Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>;

const buildEvent = (
  overrides: Partial<EligibilityEvent> = {},
): EligibilityEvent => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenders: { userWorkspaceId: USER_WORKSPACE_ID },
  ...overrides,
});

const isEligible = (event: EligibilityEvent) =>
  isUserCreditsEligibleEvent(event);

describe('isUserCreditsEligibleEvent', () => {
  it('accepts a chat token charge of a member', () => {
    expect(isEligible(buildEvent())).toBe(true);
  });

  it('accepts a native web search charge of a member', () => {
    expect(
      isEligible(buildEvent({ operationType: UsageOperationType.WEB_SEARCH })),
    ).toBe(true);
  });

  it('accepts empty or null spender columns other than the member', () => {
    expect(
      isEligible(
        buildEvent({
          spenders: {
            userWorkspaceId: USER_WORKSPACE_ID,
            apiKeyId: '',
            applicationId: null,
            agentId: null,
          },
        }),
      ),
    ).toBe(true);
  });

  it('rejects a charge that names no member', () => {
    expect(isEligible(buildEvent({ spenders: {} }))).toBe(false);
    expect(isEligible(buildEvent({ spenders: undefined }))).toBe(false);
    expect(isEligible(buildEvent({ spenders: { userWorkspaceId: '' } }))).toBe(
      false,
    );
  });

  it.each<keyof UsageSpenders>([
    'apiKeyId',
    'applicationId',
    'agentId',
    'workflowId',
    'logicFunctionId',
  ])('rejects a charge that also names a %s', (spenderColumn) => {
    expect(
      isEligible(
        buildEvent({
          spenders: {
            userWorkspaceId: USER_WORKSPACE_ID,
            [spenderColumn]: 'spender-1',
          },
        }),
      ),
    ).toBe(false);
  });
});
