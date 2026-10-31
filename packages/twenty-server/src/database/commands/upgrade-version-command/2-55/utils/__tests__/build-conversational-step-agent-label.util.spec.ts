import { buildConversationalStepAgentLabel } from 'src/database/commands/upgrade-version-command/2-55/utils/build-conversational-step-agent-label.util';

describe('buildConversationalStepAgentLabel', () => {
  it('names a generated label after the workflow and step', () => {
    expect(
      buildConversationalStepAgentLabel({
        currentLabel: 'Workflow Agent 1a2b 3c4d',
        workflowName: 'Lead intake',
        stepName: 'Qualify',
      }),
    ).toBe('Lead intake · Qualify');
  });

  it('names an empty label after whichever names exist', () => {
    expect(
      buildConversationalStepAgentLabel({
        currentLabel: '',
        workflowName: null,
        stepName: 'Qualify',
      }),
    ).toBe('Qualify');
  });

  it('keeps a label someone wrote', () => {
    expect(
      buildConversationalStepAgentLabel({
        currentLabel: 'Support triage',
        workflowName: 'Lead intake',
        stepName: 'Qualify',
      }),
    ).toBe('Support triage');
  });
});
