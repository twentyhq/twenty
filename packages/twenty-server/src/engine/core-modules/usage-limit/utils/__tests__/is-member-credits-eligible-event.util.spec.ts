import { isMemberCreditsEligibleEvent } from 'src/engine/core-modules/usage-limit/utils/is-member-credits-eligible-event.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

const PAYER = { userWorkspaceId: 'user-workspace-1' };

type EligibilityEvent = Pick<
  RecordUsageInput,
  'resourceType' | 'operationType' | 'spenders'
>;

const buildEvent = (
  overrides: Partial<EligibilityEvent> = {},
): EligibilityEvent => ({
  resourceType: UsageResourceType.AI,
  operationType: UsageOperationType.AI_CHAT_TOKEN,
  spenders: { userWorkspaceId: PAYER.userWorkspaceId },
  ...overrides,
});

const isEligible = (event: EligibilityEvent) =>
  isMemberCreditsEligibleEvent({ event, payer: PAYER });

describe('isMemberCreditsEligibleEvent', () => {
  it('accepts a chat token charge of the payer', () => {
    expect(isEligible(buildEvent())).toBe(true);
  });

  it('accepts a native web search charge of the payer', () => {
    expect(
      isEligible(buildEvent({ operationType: UsageOperationType.WEB_SEARCH })),
    ).toBe(true);
  });

  it('accepts empty or null spender columns other than the member', () => {
    expect(
      isEligible(
        buildEvent({
          spenders: {
            userWorkspaceId: PAYER.userWorkspaceId,
            apiKeyId: '',
            applicationId: null,
            agentId: null,
          },
        }),
      ),
    ).toBe(true);
  });

  it('rejects an app charge of a chat token operation', () => {
    expect(
      isEligible(buildEvent({ resourceType: UsageResourceType.APP })),
    ).toBe(false);
  });

  it('rejects a workflow or agent token charge', () => {
    expect(
      isEligible(
        buildEvent({ operationType: UsageOperationType.AI_WORKFLOW_TOKEN }),
      ),
    ).toBe(false);
  });

  it('rejects a charge of another member', () => {
    expect(
      isEligible(
        buildEvent({ spenders: { userWorkspaceId: 'user-workspace-2' } }),
      ),
    ).toBe(false);
  });

  it('rejects a charge that names no member', () => {
    expect(isEligible(buildEvent({ spenders: {} }))).toBe(false);
    expect(isEligible(buildEvent({ spenders: undefined }))).toBe(false);
    expect(
      isMemberCreditsEligibleEvent({
        event: buildEvent({ spenders: { userWorkspaceId: '' } }),
        payer: { userWorkspaceId: '' },
      }),
    ).toBe(false);
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
            userWorkspaceId: PAYER.userWorkspaceId,
            [spenderColumn]: 'spender-1',
          },
        }),
      ),
    ).toBe(false);
  });
});
