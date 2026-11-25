import { buildLogicFunctionToolApproval } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-approval.util';

const DECLINE_UNIVERSAL_IDENTIFIER = 'b1d4b0a4-6c43-4f3e-9b0f-4a5f0d9c2e11';

describe('buildLogicFunctionToolApproval', () => {
  it('gives nothing to a tool without approval settings', () => {
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: undefined,
        findAlternativeToolName: () => 'app_tool_other',
      }),
    ).toBeUndefined();
  });

  it('turns alternatives into tool names that keep their labels', () => {
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: {
          approveLabel: 'Accept meeting',
          rejectLabel: 'Not now',
          alternatives: [
            {
              logicFunctionUniversalIdentifier: DECLINE_UNIVERSAL_IDENTIFIER,
              label: 'Decline',
            },
          ],
        },
        findAlternativeToolName: (logicFunctionUniversalIdentifier) =>
          logicFunctionUniversalIdentifier === DECLINE_UNIVERSAL_IDENTIFIER
            ? 'app_tool_decline_cal_booking'
            : undefined,
      }),
    ).toEqual({
      template: 'generic',
      alternativeToolNames: ['app_tool_decline_cal_booking'],
      labels: {
        approve: 'Accept meeting',
        reject: 'Not now',
        alternatives: { app_tool_decline_cal_booking: 'Decline' },
      },
    });
  });

  it('drops an alternative that is not a tool the caller can run', () => {
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: {
          approveLabel: 'Accept meeting',
          alternatives: [
            {
              logicFunctionUniversalIdentifier: DECLINE_UNIVERSAL_IDENTIFIER,
              label: 'Decline',
            },
          ],
        },
        findAlternativeToolName: () => undefined,
      }),
    ).toEqual({
      template: 'generic',
      labels: { approve: 'Accept meeting' },
    });
  });
});
