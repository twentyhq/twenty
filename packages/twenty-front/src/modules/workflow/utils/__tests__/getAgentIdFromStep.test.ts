import { getAgentIdFromStep } from '@/workflow/utils/getAgentIdFromStep';

describe('getAgentIdFromStep', () => {
  it('should return undefined when stepDefinition is undefined', () => {
    const result = getAgentIdFromStep(undefined);

    expect(result).toBeUndefined();
  });

  it('should return undefined when stepDefinition type is trigger', () => {
    const result = getAgentIdFromStep({
      type: 'trigger',
      definition: { type: 'DATABASE_EVENT' },
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when definition is undefined', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: undefined,
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when definition type is not AI_AGENT', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: { type: 'CREATE_RECORD' },
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when settings is missing', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: { type: 'AI_AGENT' },
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when settings.input is missing', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: {
        type: 'AI_AGENT',
        settings: {},
      },
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when settings.input.agentId is missing', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: {
        type: 'AI_AGENT',
        settings: {
          input: {},
        },
      },
    });

    expect(result).toBeUndefined();
  });

  it('should return agentId when all conditions are met', () => {
    const result = getAgentIdFromStep({
      type: 'action',
      definition: {
        type: 'AI_AGENT',
        settings: {
          input: {
            agentId: 'agent-123',
          },
        },
      },
    });

    expect(result).toBe('agent-123');
  });
});
