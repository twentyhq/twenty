import { getWorkflowAiAgentStepNameAfterKindChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentStepNameAfterKindChange';

describe('getWorkflowAiAgentStepNameAfterKindChange', () => {
  it('should take the new default name when the step is named after its previous agent', () => {
    expect(
      getWorkflowAiAgentStepNameAfterKindChange({
        currentName: 'Lead scorer',
        previousAgentLabel: 'Lead scorer',
        nextDefaultName: 'Generate',
      }),
    ).toBe('Generate');
  });

  it.each(['Generate', 'Agent'])(
    'should take the new default name when the step has the default name %s',
    (currentName) => {
      expect(
        getWorkflowAiAgentStepNameAfterKindChange({
          currentName,
          previousAgentLabel: undefined,
          nextDefaultName: 'Lead scorer',
        }),
      ).toBe('Lead scorer');
    },
  );

  it('should keep a name the user typed', () => {
    expect(
      getWorkflowAiAgentStepNameAfterKindChange({
        currentName: 'Score inbound leads',
        previousAgentLabel: 'Lead scorer',
        nextDefaultName: 'Generate',
      }),
    ).toBe('Score inbound leads');
  });
});
