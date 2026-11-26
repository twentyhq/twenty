import { buildLogicFunctionToolApproval } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-approval.util';

const keepLabel = ({ message }: { message: string }) => message;

describe('buildLogicFunctionToolApproval', () => {
  it('gives nothing to a tool that does not word its approval', () => {
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: undefined,
        translateLabel: keepLabel,
      }),
    ).toBeUndefined();
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: { approveLabel: '', rejectLabel: '' },
        translateLabel: keepLabel,
      }),
    ).toBeUndefined();
  });

  it('keeps one label when the tool gives only one', () => {
    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: { rejectLabel: 'Not now' },
        translateLabel: keepLabel,
      }),
    ).toEqual({
      template: 'generic',
      labels: { reject: 'Not now' },
    });
  });

  it('translates each label with the context the CLI extracts it under', () => {
    const translationByContext: Record<string, Record<string, string>> = {
      'logicFunction.toolTriggerSettings.approval.approveLabel': {
        'Send response': 'Envoyer la réponse',
      },
      'logicFunction.toolTriggerSettings.approval.rejectLabel': {
        'Not now': 'Plus tard',
      },
    };

    expect(
      buildLogicFunctionToolApproval({
        approvalSettings: {
          approveLabel: 'Send response',
          rejectLabel: 'Not now',
        },
        translateLabel: ({ message, context }) =>
          translationByContext[context][message],
      }),
    ).toEqual({
      template: 'generic',
      labels: { approve: 'Envoyer la réponse', reject: 'Plus tard' },
    });
  });
});
