import { buildLogicFunctionToolApproval } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-approval.util';

describe('buildLogicFunctionToolApproval', () => {
  it('gives nothing to a tool that does not word its approval', () => {
    expect(buildLogicFunctionToolApproval(undefined)).toBeUndefined();
    expect(
      buildLogicFunctionToolApproval({ approveLabel: '', rejectLabel: '' }),
    ).toBeUndefined();
  });

  it('keeps the labels the tool gave', () => {
    expect(
      buildLogicFunctionToolApproval({
        approveLabel: 'Send response',
        rejectLabel: 'Not now',
      }),
    ).toEqual({
      template: 'generic',
      labels: { approve: 'Send response', reject: 'Not now' },
    });
  });

  it('keeps one label when the tool gives only one', () => {
    expect(buildLogicFunctionToolApproval({ rejectLabel: 'Not now' })).toEqual({
      template: 'generic',
      labels: { reject: 'Not now' },
    });
  });
});
