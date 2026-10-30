import { getSetuInteractionFromToolPart } from '@/ai/utils/getSetuInteractionFromToolPart';

const reference = {
  interaction: {
    schemaVersion: 1,
    kind: 'action-review',
    actionRequestId: 'action-id',
  },
};

const toolPart = (type: string, result: unknown, state = 'output-available') =>
  ({
    type,
    toolCallId: 'call-1',
    state,
    input: {},
    output: { success: true, result },
  }) as never;

describe('getSetuInteractionFromToolPart', () => {
  it('reads a reference from the proposal tool and native writes', () => {
    for (const type of [
      'tool-propose_crm_action',
      'tool-send_email',
      'tool-update_opportunity',
    ]) {
      expect(getSetuInteractionFromToolPart(toolPart(type, reference))).toEqual(
        {
          status: 'valid',
          interaction: reference.interaction,
        },
      );
    }
  });

  it('ignores a reference in any other tool output', () => {
    expect(
      getSetuInteractionFromToolPart(toolPart('tool-find_people', reference)),
    ).toBeNull();
  });

  it('waits for the call to finish and ignores invalid shapes', () => {
    expect(
      getSetuInteractionFromToolPart(
        toolPart('tool-propose_crm_action', reference, 'input-available'),
      ),
    ).toBeNull();
    expect(
      getSetuInteractionFromToolPart(
        toolPart('tool-propose_crm_action', { interaction: { kind: 'html' } }),
      ),
    ).toBeNull();
  });

  it('reads a task reference only from the research tool', () => {
    const taskReference = {
      interaction: { schemaVersion: 1, kind: 'task-status', taskId: 'task-id' },
    };

    expect(
      getSetuInteractionFromToolPart(
        toolPart('tool-start_account_research', taskReference),
      ),
    ).toEqual({ status: 'valid', interaction: taskReference.interaction });
    expect(
      getSetuInteractionFromToolPart(
        toolPart('tool-propose_crm_action', taskReference),
      ),
    ).toBeNull();
    expect(
      getSetuInteractionFromToolPart(
        toolPart('tool-start_account_research', reference),
      ),
    ).toBeNull();
  });
});
